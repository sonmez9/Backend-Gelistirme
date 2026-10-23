# TaskFlow — Kullanım Kılavuzu

Bu kılavuz, TaskFlow API'sini kendi uygulamanıza (web arayüzü, mobil uygulama, betik) nasıl bağlayacağınızı adım adım anlatır. Endpoint ayrıntıları için bkz. [api-dokumantasyonu.md](api-dokumantasyonu.md).

## 1. API'yi çalıştırın

```bash
git clone https://github.com/sonmez9/Backend-Gelistirme.git
cd Backend-Gelistirme
npm install
npm start
```

`TaskFlow API http://localhost:3000 adresinde çalışıyor` yazısını görünce API hazırdır. Farklı bir port için `PORT=4000 npm start`.

Çalıştığını doğrulayın:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## 2. Temel kurallar

- Tüm istek ve yanıtlar **JSON**'dur. Gövde gönderirken `Content-Type: application/json` başlığını ekleyin.
- Kimlik doğrulama yoktur.
- Başarılı yanıtlar `200` (ekleme için `201`) döner; hatalar `{ "error": "..." }` biçimindedir. Hata kodları: `400` (geçersiz veri), `404` (bulunamadı), `500` (sunucu hatası).
- Görevin kimliği (`id`) sunucu tarafından üretilir; sonraki isteklerde (detay, güncelleme, silme) bu `id` kullanılır.

## 3. Tipik kullanım akışı

Aşağıdaki örnekler JavaScript `fetch` ile yazılmıştır (tarayıcıda ve Node.js 18+ içinde çalışır).

### Ortak yardımcı fonksiyon

```js
const BASE_URL = 'http://localhost:3000';

async function api(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error); // 400 / 404 / 500 mesajı
  }
  return data;
}
```

### Görev oluşturun

```js
const task = await api('/tasks', {
  method: 'POST',
  body: { title: 'Backend kur', priority: 'high', assignee: 'musa' },
});
console.log(task.id); // sonraki isteklerde kullanılacak kimlik
```

### Görevi okuyun

```js
const tasks = await api('/tasks');            // hepsi (dizi)
const one = await api(`/tasks/${task.id}`);   // tek görev
```

### Durumu güncelleyin

```js
await api(`/tasks/${task.id}`, {
  method: 'PUT',
  body: { status: 'in-progress' }, // yalnızca değişen alanlar
});
```

### Görevi silin

```js
await api(`/tasks/${task.id}`, { method: 'DELETE' });
```

## 4. Listeleri daraltma

```js
// Yüksek öncelikli görevler, musa'ya atananlar ve başlık/açıklamada arama
const high = await api('/tasks?priority=high');
const mine = await api('/tasks/assignee/musa');
const found = await api('/tasks/search?keyword=backend');

// Birlikte kullanım: tamamlananlar, başlığa göre ters sıralı
const done = await api('/tasks?status=completed&sort=title&order=desc');
```

### Sayfalama

`page` veya `limit` verdiğinizde yanıtın biçimi değişir: dizi yerine `{ data, pagination }` gelir.

```js
let page = 1;
let totalPages = 1;

do {
  const result = await api(`/tasks?page=${page}&limit=10`);
  result.data.forEach((task) => console.log(task.title));
  totalPages = result.pagination.totalPages;
  page += 1;
} while (page <= totalPages);
```

## 5. Raporlar

```js
const summary = await api('/reports/summary');
console.log(`${summary.total} görev, %${summary.completionRate} tamamlandı`);
console.log(summary.byStatus);   // { pending, 'in-progress', completed }
console.log(summary.byPriority); // { low, medium, high }

const { count } = await api('/reports/completed'); // tamamlanan sayısı
```

## 6. Hataları yönetin

Doğrulama hataları, düzeltilmesi gereken alanı mesajda belirtir. Kullanıcıya göstermek için mesajı olduğu gibi kullanabilirsiniz.

```js
try {
  await api('/tasks', { method: 'POST', body: { priority: 'urgent' } });
} catch (err) {
  console.error(err.message);
  // title alanı zorunludur; priority şunlardan biri olmalıdır: low, medium, high
}
```

| Durum | Ne yapmalı |
|---|---|
| `400` | Gönderilen veriyi mesaja göre düzeltin ve tekrar deneyin |
| `404` | Görev silinmiş olabilir; listeyi yenileyin |
| `500` | Sunucu konsolundaki hatayı inceleyin |
| Bağlantı hatası | Sunucunun çalıştığından ve adresin doğru olduğundan emin olun |

## 7. İpuçları

- `PUT` kısmi güncellemedir; gönderilmeyen alanlar değişmez. Atamayı kaldırmak için `assignee: null` gönderin.
- `status` değerleri `pending`, `in-progress`, `completed`; `priority` değerleri `low`, `medium`, `high` olmalıdır, farklı yazımlar `400` döner.
- Çalışan adı aramaları (`/tasks/assignee/:name`, `assignee=`) büyük/küçük harfe duyarsızdır; `Musa` ve `musa` aynı sonucu verir.
- Veriler `src/data/tasks.json` dosyasında tutulur; sunucu yeniden başlasa da korunur.
- Her isteğin kaydı sunucu konsolunda ve `logs/requests.log` dosyasında görünür; bir sorunu ararken bu kayıttan yararlanabilirsiniz.
- Denemeleri Postman ile yapmak isterseniz [postman-rehberi.md](postman-rehberi.md) dosyasına bakın.
