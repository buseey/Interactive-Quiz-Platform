# Interactive Quiz Platform 
#### 👩‍💻 Aybüke Eraydın & 👩‍💻 Buse Yıldız

## 📌 Proje Hakkında

Bu proje, kullanıcıların canlı olarak quiz oturumlarına katılabildiği ve adminlerin quiz oluşturup yönetebildiği gerçek zamanlı bir quiz platformudur. Proje Node.js, React.js ve Firebase gibi modern teknolojiler kullanılarak geliştirilmiştir.

---

## 🚀 Kullanılan Teknolojiler

- **Backend:** Node.js, Express.js
- **Frontend:** React.js
- **Veritabanı:** MongoDB Atlas (Mongoose)
- **Authentication:** Firebase Authentication, JWT (JSON Web Token)
- **Gerçek Zamanlı İletişim:** Socket.io
- **Diğer:** RESTful API, Axios, dotenv

---

## 🎯 Proje Özellikleri

- Kullanıcı kayıt ve giriş sistemi (Firebase + JWT)
- Admin paneli üzerinden quiz ve soru oluşturma
- MongoDB üzerinde quiz ve soru verilerinin saklanması
- Socket.io ile gerçek zamanlı oyun odası ve soru yayınlama
- React ile kullanıcı ve admin arayüzleri
- Hata yönetimi ve temel validasyonlar
  ---

## 📂 Proje Yapısı

### Backend

- `/config` - Veritabanı bağlantı ayarları
- `/controllers` - API controller dosyaları
- `/models` - Mongoose şema dosyaları
- `/routes` - API endpoint tanımlamaları
- `/middleware` - Auth middleware ve hata yönetimi
- `server.js` - Uygulamanın başlangıç noktası
- `.env` - Gizli ve ortam değişkenleri
  
### Frontend

- `/components` - React bileşenleri
- `/pages` - Sayfa yapıları
- `/services` - API servisleri
- `/contexts` - AuthContext yönetimi
- `.env` - Çevresel değişkenler

---

## 🔧 Kurulum ve Çalıştırma

### Ortak Gereksinimler
- Node.js (v16+ önerilir)
- npm veya yarn
- MongoDB Atlas hesabı
- Firebase hesabı (Authentication servisi aktif olmalı)

### Backend Kurulumu

```bash
cd backend
npm install
npm run dev
```
### Frontend Kurulumu

```bash
npm install
npm start
```

