# Postman ile TaskFlow Testi — Adım Adım Rehber

## Postman nedir?

Postman, API'ye tarayıcı olmadan istek göndermeye yarayan bir programdır. Bir istek şu parçalardan oluşur:

| Parça | Anlamı | Örnek |
|---|---|---|
| Method | Ne yapmak istediğiniz | `POST` = ekle, `GET` = getir, `PUT` = güncelle, `DELETE` = sil |
| URL | Nereye gönderdiğiniz | `http://localhost:3000/tasks` |
| Body | Gönderdiğiniz veri (sadece POST/PUT) | `{ "title": "Backend kur" }` |

Cevapta ise **durum kodu** (200, 201, 400, 404) ve **JSON gövde** görürsünüz.

## 1. Hazırlık

1. Postman'i [postman.com/downloads](https://www.postman.com/downloads/) adresinden indirip kurun. Hesap açmadan "Skip and go to the app" ile de kullanabilirsiniz.
2. Terminalde proje klasörüne girip sunucuyu başlatın:
   ```bash
   cd "/Users/imdatsonmez/Projects/tnc backend/taskflow"
   npm start
   ```
   `TaskFlow API http://localhost:3000 adresinde çalışıyor` yazısını görmelisiniz. Bu terminali **açık bırakın**.

## 2. Collection'ı içe aktarın

1. Postman'de sol üstteki **Import** düğmesine tıklayın.
2. [TaskFlow.postman_collection.json](TaskFlow.postman_collection.json) dosyasını pencereye sürükleyin.
3. Soldaki **Collections** listesinde **TaskFlow API** görünür. Tıklayınca 7 klasör açılır:
   - **0 - Sunucu Kontrolü**: sunucu ayakta mı?
   - **A - Başarılı Senaryolar (CRUD)**: 7 istek, zorunlu testler.
   - **B - Hata Senaryoları**: 8 istek, hatalı isteklere API'nin verdiği cevaplar.
   - **C - Temizlik**: test verisini siler.
   - **D - İleri Seviye (İsteğe Bağlı)**: kendi test görevlerini ekler, filtreleme, arama, sayfalama ve sıralamayı dener, sonra hepsini siler.
   - **E - Validation (İsteğe Bağlı)**: geçersiz alan değerleriyle gönderilen isteklere `400` ve açıklayıcı mesaj döndüğünü gösterir.
   - **F - Raporlama (İsteğe Bağlı)**: farklı durumlarda test görevleri ekler, `/reports` endpoint'lerini dener, sonra görevleri siler.

## 3. Tek tek istek göndermek (ekran görüntüsü için önerilen yol)

1. Soldan bir isteğe tıklayın (örnek: `1 - Görev ekle: yüksek öncelik`).
2. Üstte method ve URL'yi görürsünüz. **Body** sekmesinde gönderilecek JSON vardır.
3. Mavi **Send** düğmesine basın.
4. Alttaki cevap bölümünde şunlara bakın:
   - Sağ üstte **Status: 201 Created** gibi yeşil durum kodu.
   - **Body** sekmesinde dönen JSON.
   - **Test Results** sekmesinde yeşil **PASS** satırları. İstekle birlikte çalışan otomatik kontroller buradadır.

> Önemli: `A` klasörünü **sırayla** çalıştırın. 1. istek oluşan görevin `id`'sini otomatik kaydeder, 3-7. istekler o `id`'yi `{{taskId}}` değişkeniyle kullanır. 1. isteği atlarsanız diğerleri 404 döner.

## 4. Hepsini tek seferde çalıştırmak

1. **TaskFlow API** collection'ının üzerine gelip `...` menüsünden **Run collection**'ı seçin (veya collection'a tıklayıp sağdaki **Run** düğmesine basın).
2. **Run TaskFlow API** düğmesine tıklayın.
3. Tüm istekler sırayla çalışır. Ekranda her isteğin geçen/kalan testleri listelenir. Hepsi yeşil olmalıdır (toplam 52 istek).

Bu ekranın görüntüsü, "tüm testler geçti" kanıtı olarak çok işe yarar.

## 5. Ekran görüntüsü kontrol listesi

Her görüntüde **method, URL, body (varsa), durum kodu ve cevap JSON'u** birlikte görünsün. Görüntüleri `docs/postman-screenshots/` klasörüne kaydedin.

| Dosya adı | İstek | Beklenen durum |
|---|---|---|
| `01-post-gorev-ekle.png` | 1 - Görev ekle | 201 Created |
| `03-get-gorev-listele.png` | 3 - Tüm görevleri listele | 200 OK |
| `04-get-gorev-detay.png` | 4 - Görev detayı | 200 OK |
| `05-put-guncelle-status.png`, `06-put-guncelle-coklu-alan.png` | 5 ve 6 - Güncelle | 200 OK |
| `07-delete-gorev-sil.png` | 7 - Görev sil | 200 OK |
| `08` – `15` (`hata-400-*`, `hata-404-*`) | B klasörü: hata senaryoları | 400 / 404 |

Repodaki görüntüler bu adlandırmayla [postman-screenshots/](postman-screenshots/) klasöründedir.

macOS'te ekran görüntüsü için `Cmd + Shift + 4` ile alanı seçin.

## 6. Sık karşılaşılan sorunlar

| Sorun | Neden / çözüm |
|---|---|
| `Could not get any response` / `ECONNREFUSED` | Sunucu çalışmıyor. `taskflow` klasöründe `npm start` yapın. |
| Tüm istekler 404 dönüyor | `taskId` boş. `A` klasöründe 1. isteği tekrar çalıştırın. |
| POST 400 `Geçersiz JSON` dönüyor | Body sekmesinde **raw** ve **JSON** seçili olmalı, JSON geçerli olmalıdır. |
| Port 3000 dolu | `PORT=4000 npm start` ile başlatıp collection değişkenini `http://localhost:4000` yapın (collection'a tıklayın → **Variables** → `baseUrl`). |
