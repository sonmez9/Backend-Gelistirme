# TaskFlow — Test Dokümantasyonu

Testler Postman ile elle veya **Run collection** ile toplu çalıştırılır. Collection: [TaskFlow.postman_collection.json](TaskFlow.postman_collection.json) (52 istek). Kullanım için bkz. [postman-rehberi.md](postman-rehberi.md).

## Ön koşullar

1. `npm install` ve `npm start` ile sunucu `http://localhost:3000` adresinde çalışıyor.
2. Collection Postman'e aktarılmış; `baseUrl` değişkeni `http://localhost:3000`.
3. Klasörler yukarıdan aşağıya sırayla çalıştırılıyor. Görev ekleme istekleri oluşan `id`'yi `taskId`, `taskId2` gibi değişkenlere kaydeder, sonraki istekler bunları kullanır.

Her klasör kendi test verisini oluşturup sonunda siler; testler `tasks.json` içinde veri bırakmaz.

## Test senaryoları

### Zorunlu: CRUD (klasör A)

| No | Senaryo | İstek | Beklenen sonuç |
|---|---|---|---|
| A1 | Tüm alanlarla görev ekleme | `POST /tasks` | 201; `status` = `pending` (varsayılan), `id` üretilir |
| A2 | Sadece `title` ile ekleme | `POST /tasks` `{"title":"README yaz"}` | 201; `priority` = `medium`, `assignee` = `null` |
| A3 | Listeleme | `GET /tasks` | 200; yanıt dizi |
| A4 | Detay | `GET /tasks/:id` | 200; `title` eklenen görevle aynı |
| A5 | Tek alan güncelleme | `PUT /tasks/:id` `{"status":"in-progress"}` | 200; `status` güncel, diğer alanlar korunur |
| A6 | Çok alan güncelleme | `PUT /tasks/:id` | 200; `status`, `priority`, `assignee` güncel; `updatedAt` değişir |
| A7 | Silme | `DELETE /tasks/:id` | 200; `{"message":"Görev silindi"}` |

### Hata senaryoları (klasör B)

| No | Senaryo | İstek | Beklenen sonuç |
|---|---|---|---|
| B1 | `title` yok | `POST /tasks` `{"description":"..."}` | 400 |
| B2 | Bozuk JSON | `POST /tasks` `{ title: bozuk` | 400 `Geçersiz JSON` |
| B3 | Boş `title` ile güncelleme | `PUT /tasks/:id` `{"title":""}` | 400 |
| B4 | Olmayan id — detay | `GET /tasks/olmayan-id` | 404 |
| B5 | Olmayan id — güncelleme | `PUT /tasks/olmayan-id` | 404 |
| B6 | Olmayan id — silme | `DELETE /tasks/olmayan-id` | 404 |
| B7 | Silinmiş göreve erişim | `GET /tasks/:silinenId` | 404 |
| B8 | Bilinmeyen endpoint | `GET /yok` | 404 `Endpoint bulunamadı` |

### Sunucu kontrolü (klasör 0) ve logger

| No | Senaryo | Beklenen sonuç |
|---|---|---|
| 0-1 | `GET /health` | 200; `{"status":"ok"}` |
| L1 | Herhangi bir istek gönder | Sunucu konsolunda ve `logs/requests.log` dosyasında `[ISO zaman] METHOD /endpoint` satırı oluşur (örn. `[2026-10-23T19:46:30.043Z] POST /tasks`) |

### İsteğe bağlı: filtreleme, arama, sayfalama (klasör D)

Hazırlık: 3 görev eklenir (musa/high/completed, ayse/low/pending, musa/high/in-progress).

| No | Senaryo | İstek | Beklenen sonuç |
|---|---|---|---|
| D1 | Duruma göre filtre | `GET /tasks?status=completed` | 200; hepsi `completed` |
| D2 | Önceliğe göre filtre | `GET /tasks?priority=high` | 200; hepsi `high` |
| D3 | Arama | `GET /tasks/search?keyword=backend` | 200; dizi |
| D4 | Çalışana göre | `GET /tasks/assignee/musa` | 200; hepsi `musa` |
| D5 | Sayfalama | `GET /tasks?page=1&limit=2` | 200; en fazla 2 kayıt, `pagination` alanı var |
| D6 | Sıralama | `GET /tasks?sort=createdAt` | 200; dizi |
| D7 | Ters sıralama | `GET /tasks?sort=title&order=desc` | 200; dizi |
| D8 | `keyword` yok | `GET /tasks/search` | 400 |
| D9 | Geçersiz `limit` | `GET /tasks?page=1&limit=0` | 400 |
| D10 | Geçersiz `sort` | `GET /tasks?sort=priority` | 400 |

### İsteğe bağlı: validation (klasör E)

| No | Senaryo | İstek gövdesi | Beklenen hata mesajı içeriği |
|---|---|---|---|
| E1 | `title` sayı | `{"title":123}` | `title` |
| E2 | Geçersiz `priority` | `{"title":"x","priority":"urgent"}` | `priority` |
| E3 | Geçersiz `status` | `{"title":"x","status":"done"}` | `status` |
| E4 | Boş `assignee` | `{"title":"x","assignee":""}` | `assignee` |
| E5 | `description` sayı | `{"title":"x","description":5}` | `description` |
| E6 | Birden çok hata | `{"priority":"zzz","assignee":7}` | `title alanı zorunludur` (mesajlar `;` ile birleşir) |
| E7 | Güncellemede geçersiz `priority` | `PUT /tasks/:id` `{"priority":"x"}` | `priority` |
| E8 | Güncellemede boş gövde | `PUT /tasks/:id` `{}` | `en az bir alan` |

Tüm E senaryoları 400 döner. Ek olarak elle denenenler: `title` 101 karakter, gövdenin dizi olması (`[1,2]`), `assignee: null` ile atamanın kaldırılması (200).

### İsteğe bağlı: raporlama (klasör F)

Hazırlık: tamamlanmış, bekleyen ve devam eden (atanmamış) birer görev eklenir.

| No | Senaryo | İstek | Beklenen sonuç |
|---|---|---|---|
| F1 | Tamamlanan sayısı | `GET /reports/completed` | 200; `count` ≥ 1 |
| F2 | Bekleyen sayısı | `GET /reports/pending` | 200; `count` ≥ 1 |
| F3 | Genel özet | `GET /reports/summary` | 200; `byStatus` toplamı = `total`, `byPriority` toplamı = `total`, `assigned + unassigned = total` |

Veri yokken üç endpoint de 200 döner; sayılar 0, `completionRate` 0'dır.

## Sonuçlar

- **Tüm klasörler (0, A–F):** Postman'de çalıştırılmış, tüm istekler beklenen durum kodunu döndürmüş ve **Test Results** sekmesindeki gövde testleri (`pm.test`) geçmiştir. Ekran görüntüleri [postman-screenshots/](postman-screenshots/) klasöründedir (`00`–`17` zorunlu senaryolar, `18`–`52` isteğe bağlı D, E, F klasörleri).
- Collection'daki 52 isteğin beklenen durum kodunu döndürdüğü, sunucuya sırayla gönderilen isteklerle ayrıca doğrulanmıştır.

## Test verisi hakkında

Senaryolar veriyi kendileri oluşturup siler. Bir test yarıda kesilirse `src/data/tasks.json` içinde artık görev kalabilir; dosyanın içeriğini `[]` yapmak temiz duruma döndürür. Bu durumda `reports` istekleri sayıları `≥ 1` gibi alt sınırla kontrol ettiğinden yine geçer.
