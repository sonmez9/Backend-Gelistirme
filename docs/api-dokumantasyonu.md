# TaskFlow — API Dokümantasyonu

Temel adres: `http://localhost:3000` · Format: JSON · Kimlik doğrulama: yok

İstek gövdesi gönderirken `Content-Type: application/json` başlığı kullanılmalıdır.

## Görev nesnesi

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | string | Sunucu üretir (UUID) |
| `title` | string | Başlık, zorunlu |
| `description` | string | Açıklama, varsayılan `""` |
| `status` | string | `pending` (varsayılan), `in-progress`, `completed` |
| `priority` | string | `low`, `medium` (varsayılan), `high` |
| `assignee` | string \| null | Atanan çalışan, varsayılan `null` |
| `projectId` | string \| null | Bağlı proje, varsayılan `null` |
| `createdAt`, `updatedAt` | string | ISO 8601 zaman damgası |

Alan kuralları (uzunluk sınırları dahil) için bkz. [README — Doğrulama](../README.md#doğrulama-validation-middleware).

## Hata biçimi

Tüm hatalar aynı biçimdedir:

```json
{ "error": "açıklayıcı mesaj" }
```

| Kod | Anlamı |
|---|---|
| 400 | Doğrulama hatası, geçersiz sorgu parametresi veya bozuk JSON |
| 404 | Görev veya endpoint bulunamadı |
| 500 | Beklenmeyen sunucu hatası |

---

## Görev endpoint'leri

### POST /tasks — Görev ekle

Gövde: `title` zorunlu; `description`, `status`, `priority`, `assignee`, `projectId` isteğe bağlı.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Backend kur","description":"Express projesini oluştur","priority":"high","assignee":"musa"}'
```

**201 Created**

```json
{
  "id": "0b1d6fbe-d20e-47de-be75-5164d039db4e",
  "title": "Backend kur",
  "description": "Express projesini oluştur",
  "status": "pending",
  "priority": "high",
  "assignee": "musa",
  "projectId": null,
  "createdAt": "2026-10-23T21:13:28.376Z",
  "updatedAt": "2026-10-23T21:13:28.376Z"
}
```

**400 Bad Request** — `title` yoksa:

```json
{ "error": "title alanı zorunludur" }
```

Birden çok hata varsa mesajlar `;` ile birleştirilir:

```json
{ "error": "title alanı zorunludur; priority şunlardan biri olmalıdır: low, medium, high; assignee boş olmayan bir metin olmalıdır" }
```

### GET /tasks — Görevleri listele

Sorgu parametreleri (hepsi isteğe bağlı, birlikte kullanılabilir):

| Parametre | Değer | Açıklama |
|---|---|---|
| `status` | `pending`, `in-progress`, `completed` | Duruma göre filtre |
| `priority` | `low`, `medium`, `high` | Önceliğe göre filtre |
| `assignee` | metin | Çalışana göre filtre (büyük/küçük harf duyarsız) |
| `sort` | `createdAt`, `updatedAt`, `title` | Sıralama alanı |
| `order` | `asc` (varsayılan), `desc` | Sıralama yönü |
| `page` | pozitif tam sayı (varsayılan 1) | Sayfa numarası |
| `limit` | pozitif tam sayı (varsayılan 10) | Sayfa başına kayıt |

```bash
curl "http://localhost:3000/tasks?status=completed&sort=title&order=desc"
```

**200 OK** — `page` ve `limit` verilmediğinde görev dizisi döner:

```json
[
  {
    "id": "44201778-5e48-4e44-8074-2eda8284a9aa",
    "title": "API testlerini yaz",
    "description": "backend testleri",
    "status": "completed",
    "priority": "high",
    "assignee": "musa",
    "projectId": null,
    "createdAt": "2026-10-23T21:13:28.439Z",
    "updatedAt": "2026-10-23T21:13:28.439Z"
  }
]
```

`page` veya `limit` verildiğinde yanıt sayfalama bilgisi içerir (`GET /tasks?page=2&limit=2`):

```json
{
  "data": [ { "id": "44201778-5e48-4e44-8074-2eda8284a9aa", "title": "API testlerini yaz", "...": "..." } ],
  "pagination": { "page": 2, "limit": 2, "total": 3, "totalPages": 2 }
}
```

Sayfa aralığın dışındaysa `data` boş dizi olur. **400** — geçersiz `page`/`limit` (`0`, negatif, sayı olmayan), geçersiz `sort` veya `order`, ya da aynı parametrenin birden çok kez gönderilmesi.

### GET /tasks/search — Görev ara

`keyword` parametresi zorunludur; başlık ve açıklamada, büyük/küçük harf duyarsız arar.

```bash
curl "http://localhost:3000/tasks/search?keyword=backend"
```

**200 OK** — eşleşen görevlerin dizisi (eşleşme yoksa `[]`). **400** — `keyword` yok veya boş:

```json
{ "error": "keyword parametresi zorunludur" }
```

### GET /tasks/assignee/:name — Çalışana göre listele

```bash
curl http://localhost:3000/tasks/assignee/musa
```

**200 OK** — o çalışana atanmış görevlerin dizisi (büyük/küçük harf duyarsız; yoksa `[]`).

### GET /tasks/:id — Görev detayı

```bash
curl http://localhost:3000/tasks/0b1d6fbe-d20e-47de-be75-5164d039db4e
```

**200 OK** — tek görev nesnesi. **404** — `{ "error": "Görev bulunamadı" }`

### PUT /tasks/:id — Görevi güncelle

Gövdede yalnızca değişecek alanlar gönderilir; gönderilmeyenler korunur. En az bir alan gerekir. `assignee` için `null` göndermek atamayı kaldırır. `updatedAt` otomatik güncellenir.

```bash
curl -X PUT http://localhost:3000/tasks/0b1d6fbe-d20e-47de-be75-5164d039db4e \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","assignee":"ayse"}'
```

**200 OK**

```json
{
  "id": "0b1d6fbe-d20e-47de-be75-5164d039db4e",
  "title": "Backend kur",
  "description": "Express projesini oluştur",
  "status": "completed",
  "priority": "high",
  "assignee": "ayse",
  "projectId": null,
  "createdAt": "2026-10-23T21:13:28.376Z",
  "updatedAt": "2026-10-23T21:13:28.444Z"
}
```

**400** — doğrulama hatası veya boş gövde:

```json
{ "error": "Güncellenecek en az bir alan gönderilmelidir" }
```

**404** — görev yok. Doğrulama, görev kontrolünden önce yapıldığından geçersiz gövde ile olmayan bir id'ye yapılan istek `404` değil `400` döner.

### DELETE /tasks/:id — Görevi sil

```bash
curl -X DELETE http://localhost:3000/tasks/0b1d6fbe-d20e-47de-be75-5164d039db4e
```

**200 OK**

```json
{ "message": "Görev silindi" }
```

**404** — `{ "error": "Görev bulunamadı" }` (aynı görevi ikinci kez silmek de 404 döner).

---

## Raporlama endpoint'leri

### GET /reports/completed

```json
{ "status": "completed", "count": 2 }
```

### GET /reports/pending

`pending` durumundaki görevlerin sayısı; `in-progress` görevler dahil değildir.

```json
{ "status": "pending", "count": 0 }
```

### GET /reports/summary

```json
{
  "total": 3,
  "byStatus": { "pending": 0, "in-progress": 1, "completed": 2 },
  "byPriority": { "low": 1, "medium": 0, "high": 2 },
  "assigned": 3,
  "unassigned": 0,
  "completionRate": 67
}
```

`completionRate`, tamamlanan görevlerin toplamdaki yüzdesidir (en yakın tam sayıya yuvarlanır; görev yoksa `0`).

---

## Diğer

| Endpoint | Yanıt |
|---|---|
| `GET /` | API adı ve endpoint listesi |
| `GET /health` | `{ "status": "ok" }` |
