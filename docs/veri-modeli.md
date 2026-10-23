# TaskFlow — Veri Modeli Tasarımı

Veriler `src/data/` altında JSON dosyalarında saklanır (veritabanı kullanılmaz).

## Task (uygulanan — zorunlu kapsam)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| id | string | otomatik | Benzersiz kimlik (`crypto.randomUUID()`) |
| title | string | evet | Görev başlığı |
| description | string | hayır | Görev açıklaması |
| status | string | hayır | `pending` (varsayılan), `in-progress`, `completed` |
| priority | string | hayır | `low`, `medium` (varsayılan), `high` |
| assignee | string | hayır | Görevin atandığı çalışan |
| projectId | string | hayır | Bağlı olduğu proje |
| createdAt | string (ISO 8601) | otomatik | Oluşturulma zamanı |
| updatedAt | string (ISO 8601) | otomatik | Son güncelleme zamanı |

Örnek:

```json
{
  "id": "b7c1f0de-6a4e-4a5c-9d0b-3f2f6b1f2a10",
  "title": "Backend altyapısını kur",
  "description": "Express projesini oluştur",
  "status": "pending",
  "priority": "high",
  "assignee": "musa",
  "projectId": "p1",
  "createdAt": "2026-10-23T10:00:00.000Z",
  "updatedAt": "2026-10-23T10:00:00.000Z"
}
```

## User / Çalışan (yalnızca tasarım)

| Alan | Tip | Açıklama |
|---|---|---|
| id | string | Benzersiz kimlik |
| name | string | Ad soyad |
| email | string | E-posta |

## Project / Proje (yalnızca tasarım)

| Alan | Tip | Açıklama |
|---|---|---|
| id | string | Benzersiz kimlik |
| name | string | Proje adı |
| description | string | Proje açıklaması |

## İlişkiler

- Bir proje birden çok göreve sahip olabilir (`Task.projectId → Project.id`).
- Bir çalışana birden çok görev atanabilir (`Task.assignee`).
- Zorunlu kapsamda yalnızca **Task** için CRUD uygulanır; User ve Project tasarım dokümanında yer alır.
