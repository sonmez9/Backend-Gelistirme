# TaskFlow — Görev ve Proje Yönetim Sistemi API

Node.js ve Express ile geliştirilmiş, REST mantığında bir görev yönetim API'si. Bkz. [Proje Tanıtım Dokümanı](docs/proje-tanitim.md).

## Gereksinimler

- Node.js 18 veya üzeri
- npm

## Kurulum

```bash
git clone https://github.com/sonmez9/Backend-Gelistirme.git
cd Backend-Gelistirme
npm install
```

## Çalıştırma

```bash
npm start        # sunucuyu başlatır
npm run dev      # nodemon ile, dosya değişince otomatik yeniden başlatır
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Port değiştirmek için:

```bash
PORT=4000 npm start
```

## Endpoint'ler

| Method | Endpoint | Açıklama | Başarılı yanıt |
|---|---|---|---|
| POST | `/tasks` | Yeni görev ekler | 201 |
| GET | `/tasks` | Tüm görevleri listeler | 200 |
| GET | `/tasks/:id` | Görev detayını getirir | 200 |
| PUT | `/tasks/:id` | Görevi günceller | 200 |
| DELETE | `/tasks/:id` | Görevi siler | 200 |
| GET | `/tasks/search?keyword=` | Başlık ve açıklamada arama | 200 |
| GET | `/tasks/assignee/:name` | Çalışana atanmış görevler | 200 |
| GET | `/health` | Sunucu sağlık kontrolü | 200 |

### Filtreleme, sıralama ve sayfalama

`GET /tasks` aşağıdaki sorgu parametrelerini destekler (hepsi isteğe bağlı, birlikte kullanılabilir):

| Parametre | Örnek | Açıklama |
|---|---|---|
| `status` | `/tasks?status=completed` | Duruma göre filtre |
| `priority` | `/tasks?priority=high` | Önceliğe göre filtre |
| `assignee` | `/tasks?assignee=musa` | Çalışana göre filtre (büyük/küçük harf duyarsız) |
| `sort` | `/tasks?sort=createdAt` | `createdAt`, `updatedAt` veya `title` |
| `order` | `/tasks?sort=title&order=desc` | `asc` (varsayılan) veya `desc` |
| `page`, `limit` | `/tasks?page=1&limit=10` | Sayfalama (`limit` varsayılanı 10) |

`page` veya `limit` verilmezse yanıt düz bir dizidir. Verilirse yanıt şu biçimdedir:

```json
{
  "data": [ ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

Geçersiz `page`/`limit`/`sort`/`order` değerleri ve eksik `keyword` için `400` döner.

### Görev alanları

| Alan | Zorunlu | Değerler / Açıklama |
|---|---|---|
| `title` | evet | Görev başlığı |
| `description` | hayır | Açıklama |
| `status` | hayır | `pending` (varsayılan), `in-progress`, `completed` |
| `priority` | hayır | `low`, `medium` (varsayılan), `high` |
| `assignee` | hayır | Görevin atandığı çalışan |
| `projectId` | hayır | Bağlı olduğu proje |

`id`, `createdAt` ve `updatedAt` sunucu tarafından otomatik üretilir.

### Örnek istek

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Backend kur", "priority": "high", "assignee": "musa"}'
```

```json
{
  "id": "b7b206a2-5c0b-4626-9991-d891b6c73a0b",
  "title": "Backend kur",
  "description": "",
  "status": "pending",
  "priority": "high",
  "assignee": "musa",
  "projectId": null,
  "createdAt": "2026-10-23T19:46:30.050Z",
  "updatedAt": "2026-10-23T19:46:30.050Z"
}
```

### Doğrulama (validation middleware)

`POST /tasks` ve `PUT /tasks/:id` istekleri, controller'a ulaşmadan önce [validateTask.js](src/middlewares/validateTask.js) ile denetlenir:

| Alan | Kural |
|---|---|
| `title` | Eklemede zorunlu; boş olmayan metin, en fazla 100 karakter |
| `description` | Metin, en fazla 500 karakter |
| `priority` | `low`, `medium` veya `high` |
| `status` | `pending`, `in-progress` veya `completed` |
| `assignee` | Boş olmayan metin, en fazla 50 karakter (`null` = atamayı kaldır) |
| `projectId` | Metin veya `null` |

Güncellemede en az bir alan gönderilmelidir. Geçersiz veride `400 Bad Request` ve açıklayıcı mesaj döner; birden çok hata varsa `;` ile birleştirilir:

```json
{ "error": "title alanı zorunludur; priority şunlardan biri olmalıdır: low, medium, high" }
```

### Hata yanıtları

| Kod | Durum |
|---|---|
| 400 | Doğrulama hatası, geçersiz sorgu parametresi veya geçersiz JSON |
| 404 | Görev veya endpoint bulunamadı |
| 500 | Sunucu hatası |

## Logger

Her istek `[zaman damgası] METHOD /endpoint` biçiminde konsola ve `logs/requests.log` dosyasına yazılır.

## Postman ile test

[docs/TaskFlow.postman_collection.json](docs/TaskFlow.postman_collection.json) dosyasını Postman'e import edin (Import → dosyayı seçin). Collection içinde 43 istek vardır (CRUD, hata senaryoları, temizlik, filtreleme/arama/sayfalama ve validation). Klasörleri sırayla çalıştırın; görev ekleme istekleri oluşan `id` değerini otomatik kaydeder. Adım adım kullanım için bkz. [docs/postman-rehberi.md](docs/postman-rehberi.md). Test ekran görüntüleri [docs/postman-screenshots/](docs/postman-screenshots/) klasöründedir.

## Proje yapısı

```
src/
├── app.js          # Express uygulaması, middleware ve route kaydı
├── server.js       # Sunucuyu başlatır
├── routes/         # URL → controller eşlemeleri
├── controllers/    # İstek/yanıt yönetimi
├── services/       # tasks.json okuma/yazma
├── middlewares/    # Logger ve validation
└── data/           # tasks.json (veri deposu)
docs/               # Tasarım dokümanları, Postman collection ve ekran görüntüleri
```

Veriler veritabanı yerine `src/data/tasks.json` dosyasında saklanır.
