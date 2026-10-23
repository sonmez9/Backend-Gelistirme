# TaskFlow — Proje Tanıtım Dokümanı

## Amaç

TaskFlow, bir yazılım şirketinin ekip içindeki görevleri, projeleri ve çalışanların sorumluluklarını takip edebilmesi için geliştirilen bir **Görev ve Proje Yönetim Sistemi API**'sidir. Proje, Node.js ile Backend Programlama eğitiminde edinilen bilgilerin (Node.js, Express.js, REST API, Routing, Middleware, CRUD, JSON veri yönetimi) uygulamalı olarak gösterilmesi amacıyla hazırlanmıştır.

## Senaryo

Şirket; görevlerin oluşturulmasını, çalışanlara atanmasını, durumlarının takip edilmesini ve önceliklendirilmesini istemektedir. Sistem tamamen **REST API** mantığında geliştirilmiştir: her kaynak bir URL ile temsil edilir, işlemler HTTP metotlarıyla (POST, GET, PUT, DELETE) yapılır ve veriler JSON formatında alınıp verilir.

## Temel Sistem Özellikleri

- **Görev ekleme:** Yeni görev oluşturma (`POST /tasks`)
- **Görev listeleme:** Tüm görevleri görüntüleme (`GET /tasks`)
- **Görev detayı:** Belirli bir görevi görüntüleme (`GET /tasks/:id`)
- **Görev güncelleme:** Görev bilgilerini güncelleme (`PUT /tasks/:id`)
- **Görev silme:** Görevi sistemden kaldırma (`DELETE /tasks/:id`)
- **Durum takibi:** `pending`, `in-progress`, `completed`
- **Öncelik yönetimi:** `low`, `medium`, `high`
- **Çalışana atama:** `assignee` alanı ile
- **Logger middleware:** Tüm isteklerin method, endpoint ve zaman damgasıyla kaydı
- **İleri seviye (isteğe bağlı):** filtreleme, arama, sıralama ve sayfalama; validation middleware; raporlama servisleri

## Kullanılan Teknolojiler

Node.js, Express.js, JSON dosyası ile veri saklama, Postman (test).

## Proje Yapısı

```
src/
├── app.js          # Express uygulaması, middleware ve route kaydı
├── server.js       # Sunucuyu başlatır
├── routes/         # URL → controller eşlemeleri
├── controllers/    # İstek/yanıt yönetimi
├── services/       # JSON dosyası okuma/yazma
├── middlewares/    # Logger
└── data/           # tasks.json
```

Ayrıntılar için bkz. [veri-modeli.md](veri-modeli.md) ve [api-tasarimi.md](api-tasarimi.md).
