# OAuth Kurulum Rehberi (Google & GitHub)

## 🔑 Gerekli API Keys

### 1. Google OAuth Setup

#### Adım 1: Google Cloud Console
1. https://console.cloud.google.com/ adresine git
2. Yeni proje oluştur veya mevcut projeyi seç
3. Sol menüden **APIs & Services** > **Credentials** seç

#### Adım 2: OAuth Client ID Oluştur
1. **+ CREATE CREDENTIALS** > **OAuth client ID** tıkla
2. **Application type**: Web application
3. **Name**: SoftNews Web Client
4. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://softnews-six.vercel.app
   ```
5. **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/google/callback
   https://softnews-six.vercel.app/auth/google/callback
   ```
6. **CREATE** tıkla
7. **Client ID**'yi kopyala

#### Adım 3: Environment Variables (Vercel)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

#### Adım 4: Environment Variables (Local - .env)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

---

### 2. GitHub OAuth Setup

#### Adım 1: GitHub Developer Settings
1. https://github.com/settings/developers adresine git
2. **OAuth Apps** > **New OAuth App** tıkla

#### Adım 2: OAuth App Oluştur
1. **Application name**: SoftNews
2. **Homepage URL**: `https://softnews-six.vercel.app`
3. **Authorization callback URL**: 
   ```
   https://softnews-six.vercel.app/auth/github/callback
   ```
4. **Register application** tıkla
5. **Client ID**'yi kopyala
6. **Generate a new client secret** tıkla ve secret'ı kopyala

#### Adım 3: Environment Variables (Vercel)
```env
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

#### Adım 4: Environment Variables (Local - .env)
```env
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

## 📦 Vercel Environment Variables (Tümü)

Vercel Dashboard > Settings > Environment Variables:

```env
# News API
GNEWS_API_KEY=your_gnews_api_key

# AI API
GROQ_API_KEY=your_groq_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# GitHub OAuth (Frontend + Backend)
VITE_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# JWT Secret
JWT_SECRET=your_random_secret_key_here
```

---

## 🧪 Test Etme

### Google OAuth Test:
1. Kayıt Ol sayfasına git: `/register`
2. Google butonu tıkla
3. Google hesabı seç
4. İzinleri onayla
5. Otomatik giriş yapmalı

### GitHub OAuth Test:
1. Giriş Yap sayfasına git: `/login`
2. GitHub butonu tıkla
3. GitHub'a yönlendirileceksin
4. Authorize tıkla
5. Callback'e dönecek ve giriş yapacak

---

## 🔒 Güvenlik Notları

1. **Client Secret'ları asla frontend'de kullanma!**
   - `GITHUB_CLIENT_SECRET` sadece backend'de (Vercel Functions)
   - `VITE_` prefix'li olanlar frontend'de görünür

2. **Production URL'leri güncelle:**
   - Google Console'da production URL ekle
   - GitHub OAuth App'te production callback URL ekle

3. **CORS ayarları:**
   - API'lerde zaten CORS headers var ✅

---

## ✅ Kontrol Listesi

- [ ] Google Cloud Console'da OAuth Client ID oluşturuldu
- [ ] Google Client ID Vercel'e eklendi
- [ ] GitHub OAuth App oluşturuldu
- [ ] GitHub Client ID ve Secret Vercel'e eklendi
- [ ] Vercel'de redeploy yapıldı
- [ ] Google ile giriş test edildi
- [ ] GitHub ile giriş test edildi

---

## 🐛 Sorun Giderme

### "Google Client ID is missing" hatası:
- Vercel'de `VITE_GOOGLE_CLIENT_ID` var mı kontrol et
- Redeploy yap

### "GitHub redirect mismatch" hatası:
- GitHub OAuth App'te callback URL'i kontrol et
- `https://softnews-six.vercel.app/auth/github/callback` olmalı

### "Unauthorized" hatası:
- Supabase'de `users` tablosu var mı kontrol et
- `/api/social-auth` endpoint'i çalışıyor mu test et
