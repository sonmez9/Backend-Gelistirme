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
| Middleware | `src/middlewares/logger.js` | İstek loglama |

## Endpoint Listesi

| Method | Endpoint | Açıklama | Başarılı yanıt |
|---|---|---|---|
| POST | `/tasks` | Yeni görev ekler | 201 Created |
| GET | `/tasks` | Tüm görevleri listeler | 200 OK |
| GET | `/tasks/:id` | Tek görevin detayı | 200 OK |
| PUT | `/tasks/:id` | Görevi günceller | 200 OK |
| DELETE | `/tasks/:id` | Görevi siler | 200 OK |
| GET | `/health` | Sunucu sağlık kontrolü | 200 OK |

## Hata Yanıtları

| Durum | Kod | Gövde |
|---|---|---|
| Görev bulunamadı | 404 | `{ "error": "Görev bulunamadı" }` |
| Bilinmeyen endpoint | 404 | `{ "error": "Endpoint bulunamadı" }` |
| Zorunlu alan eksik (`title`) | 400 | `{ "error": "title alanı zorunludur" }` |
| Sunucu hatası | 500 | `{ "error": "Sunucu hatası" }` |

## Logger Middleware

Her istekte `[ISO zaman damgası] METHOD /endpoint` biçiminde konsola yazar.
