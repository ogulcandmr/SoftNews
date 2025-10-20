# 🚀 SoftNews - Teknoloji Haberleri Platformu

Modern, AI destekli teknoloji haberleri ve topluluk platformu.

🔗 **Live Demo:** [softnews-six.vercel.app](https://softnews-six.vercel.app)

---

## 📱 Proje Hakkında

**SoftNews**, yazılım ve teknoloji dünyasından güncel haberleri, YouTube videolarını ve kullanıcı forumunu bir araya getiren full-stack web uygulamasıdır. Yapay zeka destekli içerik analizi, otomatik haber özetleme ve akıllı forum yanıtlama özellikleriyle modern bir haber platformu deneyimi sunar.

### ✨ Ana Özellikler

- 🤖 **AI Destekli İçerik Analizi** - Groq AI ile otomatik haber özetleme
- 📰 **Gerçek Zamanlı Haberler** - GNews API entegrasyonu
- 📺 **YouTube Video Entegrasyonu** - İlgili teknoloji videoları
- 💬 **Topluluk Forumu** - AI destekli otomatik yanıtlar
- 🔐 **Güvenli Kimlik Doğrulama** - JWT + OAuth 2.0 (Google, GitHub)
- 🎨 **Modern UI/UX** - Responsive, dark mode, smooth animations
- ⚡ **Yüksek Performans** - Smart caching, lazy loading

---

## 🛠️ Teknoloji Stack'i

### Frontend
- React 18.3, Vite 7.1
- Tailwind CSS 3.4, Bootstrap 5.3, MDB React UI Kit
- Framer Motion, React Router DOM

### Backend
- Vercel Serverless Functions
- Supabase (PostgreSQL)
- JWT, bcryptjs

### AI & APIs
- Groq AI API
- GNews API
- YouTube Data API v3
- Google/GitHub OAuth

**Detaylı teknoloji listesi için:** [TECH_STACK.md](./TECH_STACK.md)

---

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Environment Variables
`.env` dosyası oluştur:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_key
GROQ_API_KEY=your_groq_key
YOUTUBE_API_KEY=your_youtube_key
```

### 3. Geliştirme Sunucusu
```bash
npm run dev
```

Tarayıcıda aç: [http://localhost:5173](http://localhost:5173)

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 📊 Özellikler Detayı

### 🔐 Kullanıcı Yönetimi
- Email/şifre ile kayıt ve giriş
- Google & GitHub OAuth
- JWT token authentication
- Şifre sıfırlama
- Profil yönetimi

### 📰 Haber Sistemi
- GNews API ile gerçek zamanlı haberler
- Kategori filtreleme
- 24 saat cache
- Duplicate filtreleme
- Türkçe/İngilizce destek

### 🤖 AI Özellikleri
- Haftalık haber özeti
- 4 bölümlü içerik analizi
- Akıllı anahtar kelimeler
- Forum AI asistanı

### 📺 Video Entegrasyonu
- YouTube API v3
- Kategori filtreleme
- İlgili video önerileri
- 24 saat cache

### 💬 Forum
- Konu oluşturma
- Yorum sistemi
- AI otomatik yanıtlar
- Kullanıcı istatistikleri

## AI Özellikleri (MVP)
- Ana sayfada "Bu Haftalık Özet" (AI ile özet, 24 saat cache)
- AI sağlayıcı ayarları .env ile yapılandırılır
- Geliştirmede basit proxy ile `/api/ai` yönlendirmesi

### Netlify Functions ile Prod Proxy
1) Netlify projesi oluşturun ve bu repo’yu bağlayın.
2) Netlify dashboard > Site settings > Environment variables:
   - `OPENAI_API_KEY`: (gizli anahtar)
   - `AI_API_URL` (opsiyonel): `https://api.openai.com/v1/chat/completions`
3) `netlify.toml` ve `netlify/functions/ai.js` eklendi. Deploy sonrası `/api/ai` → `/.netlify/functions/ai` üzerinden çalışır.
4) Yerelde test: `npm run dev` ve ayrıca `netlify dev` (Netlify CLI) ile fonksiyonları çalıştırabilirsiniz.

### Haber API’si (NewsAPI.org)
1) `NEWS_API_KEY` anahtarını Netlify environment variables’a ekleyin.
2) Deploy sonrası `/api/news` fonksiyonu aktif olur; `HomePage` açılışta haberleri buradan çeker, sorun olursa dummy veriye düşer.

### Sağlayıcı Seçimi (Ücretsiz Alternatif)
- `NEWS_PROVIDER=newsapi` (varsayılan) veya `gnews` kullanabilirsiniz.
- `gnews` için `GNEWS_API_KEY` ekleyin. Ücretsiz planlar için kota limitlerini kontrol edin.

### Yerel Geliştirme
- Önerilen: `netlify dev` ile fonksiyonları çalıştırın (anahtarlar tarayıcıya gitmez).
- Hızlı test: `.env` ile `VITE_AI_ENDPOINT=https://api.openai.com/v1/chat/completions` (sadece yerel). Örnek değerler için `ENV_EXAMPLE` dosyasına bakın.

### Ortam Değişkenleri
`.env` (veya `.env.local`) dosyasına aşağıdakileri ekleyin:

```env
VITE_AI_ENDPOINT=/api/ai
VITE_AI_API_KEY=YOUR_KEY_HERE
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_PROVIDER=openai-compatible
# Geliştirmede harici API'ye proxy için (opsiyonel):
# VITE_AI_PROXY_TARGET=https://api.openai.com/v1/chat/completions
```

Not: Üretimde anahtarınızı doğrudan istemciye vermeyin. `/api/ai` için bir backend proxy (örn. Cloudflare Workers/Netlify Functions) önerilir.

## Notlar
- Tailwind, Bootstrap ve MDBReact birlikte kullanılmaktadır.
- Geliştirme için Vite kullanılmıştır.
