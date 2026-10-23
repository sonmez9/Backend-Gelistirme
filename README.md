# TaskFlow — Görev ve Proje Yönetim Sistemi API

Node.js ve Express ile geliştirilmiş, REST mantığında bir görev yönetim API'si. Bkz. [Proje Tanıtım Dokümanı](docs/proje-tanitim.md).

## Gereksinimler

- Node.js 18 veya üzeri
- npm

## Kurulum

```bash
git clone <repo-adresi>
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
| GET | `/health` | Sunucu sağlık kontrolü | 200 |

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

### Hata yanıtları

| Kod | Durum |
|---|---|
| 400 | `title` eksik/boş veya geçersiz JSON |
| 404 | Görev veya endpoint bulunamadı |
| 500 | Sunucu hatası |

## Logger

Her istek `[zaman damgası] METHOD /endpoint` biçiminde konsola ve `logs/requests.log` dosyasına yazılır.

## Postman ile test

[docs/TaskFlow.postman_collection.json](docs/TaskFlow.postman_collection.json) dosyasını Postman'e import edin (Import → dosyayı seçin). Collection içinde 17 istek vardır (CRUD, hata senaryoları, temizlik). Klasörleri sırayla çalıştırın; görev ekleme istekleri oluşan `id` değerini otomatik kaydeder. Adım adım kullanım için bkz. [docs/postman-rehberi.md](docs/postman-rehberi.md). Test ekran görüntüleri [docs/postman-screenshots/](docs/postman-screenshots/) klasöründedir.

## Proje yapısı

```
src/
├── app.js          # Express uygulaması, middleware ve route kaydı
├── server.js       # Sunucuyu başlatır
├── routes/         # URL → controller eşlemeleri
├── controllers/    # İstek/yanıt yönetimi
├── services/       # tasks.json okuma/yazma
├── middlewares/    # Logger
└── data/           # tasks.json (veri deposu)
docs/               # Tasarım dokümanları, Postman collection ve ekran görüntüleri
```

Veriler veritabanı yerine `src/data/tasks.json` dosyasında saklanır.
