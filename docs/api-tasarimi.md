# TaskFlow — API Tasarım Dokümanı

## Mimari

İstek akışı: `İstemci → Logger middleware → Router → Controller → Service (JSON dosyası) → Yanıt`

| Katman | Dosya | Sorumluluk |
|---|---|---|
| Uygulama | `src/app.js` | Express kurulumu, middleware ve route kaydı |
| Sunucu | `src/server.js` | Portu dinleme |
| Route | `src/routes/task.routes.js` | URL → controller eşlemesi |
| Controller | `src/controllers/task.controller.js` | İstek/yanıt yönetimi, HTTP durum kodları |
| Service | `src/services/task.service.js` | JSON dosyasında okuma/yazma, iş mantığı |
| Raporlama | `routes/report.routes.js`, `controllers/report.controller.js`, `services/report.service.js` | Görevler üzerinde sayma ve özetleme (yalnızca okur) |
| Middleware | `src/middlewares/logger.js` | İstek loglama |
| Middleware | `src/middlewares/validateTask.js` | POST/PUT gövde doğrulaması (isteğe bağlı) |

## Endpoint Listesi

| Method | Endpoint | Açıklama | Başarılı yanıt |
|---|---|---|---|
| POST | `/tasks` | Yeni görev ekler | 201 Created |
| GET | `/tasks` | Tüm görevleri listeler | 200 OK |
| GET | `/tasks/:id` | Tek görevin detayı | 200 OK |
| PUT | `/tasks/:id` | Görevi günceller | 200 OK |
| DELETE | `/tasks/:id` | Görevi siler | 200 OK |
| GET | `/tasks?status=&priority=&assignee=&sort=&order=&page=&limit=` | Filtreleme, sıralama, sayfalama (isteğe bağlı) | 200 OK |
| GET | `/tasks/search?keyword=` | Başlık ve açıklamada arama (isteğe bağlı) | 200 OK |
| GET | `/tasks/assignee/:name` | Çalışana göre listeleme (isteğe bağlı) | 200 OK |
| GET | `/reports/completed` | Tamamlanan görev sayısı (isteğe bağlı) | 200 OK |
| GET | `/reports/pending` | Bekleyen görev sayısı (isteğe bağlı) | 200 OK |
| GET | `/reports/summary` | Durum, öncelik ve atama özeti (isteğe bağlı) | 200 OK |
| GET | `/health` | Sunucu sağlık kontrolü | 200 OK |

`/tasks/search` ve `/tasks/assignee/:name` yolları, `/tasks/:id` ile çakışmaması için route dosyasında `/:id` tanımından önce yer alır.

## Hata Yanıtları

| Durum | Kod | Gövde |
|---|---|---|
| Görev bulunamadı | 404 | `{ "error": "Görev bulunamadı" }` |
| Bilinmeyen endpoint | 404 | `{ "error": "Endpoint bulunamadı" }` |
| Doğrulama hatası (örn. `title` eksik) | 400 | `{ "error": "title alanı zorunludur" }` |
| Geçersiz `page`/`limit`/`sort`/`order` veya eksik `keyword` | 400 | `{ "error": "..." }` |
| Sunucu hatası | 500 | `{ "error": "Sunucu hatası" }` |

## Validation Middleware (isteğe bağlı)

İstek akışında Router ile Controller arasında çalışır: `POST /tasks` ve `PUT /tasks/:id`. Kurallar (`title`, `description`, `priority`, `status`, `assignee`, `projectId`) README'deki doğrulama tablosundadır. Geçersiz veride controller çalışmadan `400` ve açıklayıcı bir `error` mesajı döner. Doğrulama, görevin var olup olmadığı kontrolünden önce yapılır; yani geçersiz gövdeyle olmayan bir id'ye `PUT` yapılırsa `404` yerine `400` döner.

## Logger Middleware

Her istekte `[ISO zaman damgası] METHOD /endpoint` biçiminde konsola yazar.
