# 🚀 SoftNews - Teknoloji Haberleri Platformu

Modern, AI destekli teknoloji haberleri ve topluluk platformu.

---

## 📱 Proje Özeti

**SoftNews**, yazılım ve teknoloji dünyasından güncel haberleri, YouTube videolarını ve kullanıcı forumunu bir araya getiren full-stack web uygulamasıdır. Yapay zeka destekli içerik analizi, otomatik haber özetleme ve akıllı forum yanıtlama özellikleriyle modern bir haber platformu deneyimi sunar.

🔗 **Live Demo:** [softnews-six.vercel.app](https://softnews-six.vercel.app)

---

## 🛠️ Teknoloji Stack'i

### **Frontend**
- ⚛️ **React 18.3** - Modern UI geliştirme
- 🎨 **Tailwind CSS 3.4** - Utility-first CSS framework
- 💅 **Bootstrap 5.3** - Responsive component library
- 🎭 **MDB React UI Kit 9.0** - Material Design components
- 🎬 **Framer Motion 12.23** - Animasyon ve geçişler
- 🧭 **React Router DOM 7.6** - Client-side routing
- ⚡ **Vite 7.1** - Hızlı build tool ve dev server

### **Backend & API**
- 🔧 **Vercel Serverless Functions** - Backend API endpoints
- 🗄️ **Supabase** - PostgreSQL database & authentication
- 🔐 **JWT (jsonwebtoken 9.0)** - Token-based authentication
- 🔒 **bcryptjs 3.0** - Password hashing
- 🌐 **CORS 2.8** - Cross-origin resource sharing

### **Yapay Zeka & API Entegrasyonları**
- 🤖 **Groq AI API** - Haber özetleme ve içerik analizi
- 📰 **GNews API** - Gerçek zamanlı haber çekme
- 📺 **YouTube Data API v3** - Video entegrasyonu
- 🔍 **Google Auth Library 10.4** - OAuth 2.0 authentication

### **Veritabanı Yapısı**
- 👥 **users** - Kullanıcı profilleri ve kimlik doğrulama
- 💬 **user_forum_topics** - Forum konuları
- 💭 **user_forum_replies** - Forum yanıtları
- ⭐ **user_favorites** - Favori haberler
- 🔑 **password_reset_tokens** - Şifre sıfırlama
- 📊 **user_ai_stats** - AI kullanım istatistikleri
- 🎫 **user_sessions** - Oturum yönetimi

---

## ✨ Özellikler

### **🔐 Kullanıcı Yönetimi**
- Email/şifre ile kayıt ve giriş
- Google OAuth 2.0 entegrasyonu
- GitHub OAuth entegrasyonu
- JWT tabanlı oturum yönetimi
- Şifre sıfırlama sistemi
- Kullanıcı profil yönetimi

### **📰 Haber Sistemi**
- GNews API ile gerçek zamanlı haber çekme
- Kategori bazlı filtreleme (Teknoloji, Yazılım, AI, vb.)
- Akıllı önbellek sistemi (24 saat TTL)
- Duplicate haber filtreleme
- Türkçe/İngilizce içerik desteği
- Responsive haber kartları

### **🤖 AI Özellikleri**
- **Haftalık Özet:** Groq AI ile otomatik haber özetleme
- **İçerik Analizi:** Haber detaylarını 4 bölüme ayırma
  - 📋 Gelişmenin Detayları
  - ⚙️ Teknik Özellikler
  - 📊 Sektörel Etkiler
  - 🔮 Gelecek Perspektifi
- **Akıllı Anahtar Kelimeler:** Her haber için otomatik tag üretimi
- **Forum AI Asistanı:** Otomatik forum yanıtlama
- **Önbellek Optimizasyonu:** AI yanıtları 6 saat cache

### **📺 Video Entegrasyonu**
- YouTube Data API v3 entegrasyonu
- Kategori bazlı video filtreleme
- İlgili video önerileri
- Video arama ve keşfet
- Responsive video player
- 24 saat video cache

### **💬 Topluluk Forumu**
- Konu oluşturma ve yönetimi
- Yorum sistemi
- AI destekli otomatik yanıtlar
- Kullanıcı etkileşim istatistikleri
- Real-time güncellemeler

### **🎨 UI/UX Özellikleri**
- Fully responsive tasarım (mobil, tablet, desktop)
- Dark/Light mode desteği
- Smooth animasyonlar (Framer Motion)
- Loading states ve skeleton screens
- Toast notifications
- Error handling ve fallback UI
- Accessibility (a11y) uyumlu

---

## 🏗️ Mimari & Tasarım Desenleri

### **Frontend Mimarisi**
- **Component-based architecture** - Modüler ve yeniden kullanılabilir bileşenler
- **Context API** - Global state yönetimi (Auth, Theme)
- **Custom Hooks** - Tekrar kullanılabilir logic
- **Service Layer** - API çağrıları için ayrı servis katmanı
- **Route Protection** - Private route guards

### **Backend Mimarisi**
- **Serverless Functions** - Scalable API endpoints
- **Database Abstraction** - Supabase client wrapper
- **Error Handling** - Merkezi hata yönetimi
- **Input Validation** - Request validation
- **Rate Limiting** - API quota yönetimi

### **Güvenlik**
- 🔐 JWT token authentication
- 🔒 Bcrypt password hashing
- 🛡️ SQL injection koruması (Supabase)
- 🚫 XSS koruması
- 🔑 Environment variables ile secret yönetimi
- 📝 Row Level Security (RLS) policies

### **Performans Optimizasyonları**
- ⚡ Vite ile hızlı build
- 💾 Multi-level caching (localStorage + API)
- 🎯 Lazy loading
- 📦 Code splitting
- 🖼️ Image optimization
- 🔄 Debouncing & throttling

---

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth?action=register` - Kullanıcı kaydı
- `POST /api/auth?action=login` - Giriş
- `GET /api/auth?action=profile` - Profil bilgisi
- `PUT /api/auth?action=profile` - Profil güncelleme

### **News**
- `GET /api/news` - Haber listesi
- `GET /api/article` - AI analizi ile detaylı haber

### **YouTube**
- `GET /api/youtube?q={query}&max={limit}` - Video arama

### **Forum**
- `GET /api/forum-topics` - Forum konuları
- `POST /api/forum-topic` - Yeni konu
- `GET /api/forum-replies?topicId={id}` - Yorumlar
- `POST /api/forum-auto-reply` - AI yanıt

### **AI**
- `POST /api/ai` - Groq AI proxy

---

## 🚀 Deployment & DevOps

### **Hosting**
- **Vercel** - Frontend & Serverless Functions
- **Supabase** - Database & Authentication
- **GitHub** - Version control & CI/CD

### **Environment Variables**
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Authentication
JWT_SECRET=your_jwt_secret

# APIs
GNEWS_API_KEY=your_gnews_key
GROQ_API_KEY=your_groq_key
YOUTUBE_API_KEY=your_youtube_key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### **Build & Deploy**
```bash
# Development
npm run dev

# Production Build
npm run build

# Preview
npm run preview
```

---

## 📈 Öne Çıkan Teknik Başarılar

✅ **Serverless Architecture** - Scalable ve cost-effective backend  
✅ **AI Integration** - Groq API ile akıllı içerik analizi  
✅ **Real-time Data** - GNews ve YouTube API entegrasyonu  
✅ **Smart Caching** - Multi-level cache stratejisi ile performans  
✅ **Responsive Design** - Tüm cihazlarda mükemmel UX  
✅ **Security First** - JWT, bcrypt, RLS ile güvenli mimari  
✅ **Modern Stack** - React 18, Vite, Tailwind ile güncel teknolojiler  
✅ **Full-Stack** - Frontend'den database'e tam stack geliştirme  

---

## 👨‍💻 Geliştirici

**Öğülcan Demir**  
Full-Stack Developer | AI Enthusiast

🔗 [LinkedIn](https://linkedin.com/in/ogulcandemir)  
🐙 [GitHub](https://github.com/ogulcandmr)  
🌐 [Portfolio](https://softnews-six.vercel.app)

---

## 📝 Lisans

Bu proje özel bir projedir.

---

## 🙏 Teşekkürler

- **Groq** - Hızlı AI inference
- **GNews** - Haber API'si
- **YouTube** - Video API'si
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting & deployment

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
