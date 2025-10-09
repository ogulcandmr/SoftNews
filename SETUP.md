# 🚀 SoftNews - Kurulum Talimatları

## 📋 Gereksinimler

- Node.js 18+
- Netlify hesabı
- Supabase hesabı
- Google Cloud Console hesabı
- GitHub hesabı

## 🗄️ 1. Supabase Veritabanı Kurulumu

### 1.1 Supabase Projesi Oluşturma
1. [Supabase](https://supabase.com) → New Project
2. Proje adı: `softnews-db`
3. Database Password oluşturun
4. Region: Europe (Frankfurt) seçin

### 1.2 Veritabanı Şeması
1. Supabase Dashboard → SQL Editor
2. `supabase-schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'da çalıştırın

### 1.3 API Keys
1. Supabase Dashboard → Settings → API
2. **Project URL** ve **anon public** key'i kopyalayın

## 🔑 2. Google OAuth Kurulumu

### 2.1 Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com/)
2. New Project → `softnews-oauth`
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID

### 2.2 OAuth Consent Screen
1. OAuth consent screen → External → Create
2. App name: `SoftNews`
3. User support email: `ogulcandmr96@gmail.com`
4. Developer contact: `ogulcandmr96@gmail.com`

### 2.3 OAuth Client
1. Application type: Web application
2. Name: `SoftNews Web Client`
3. **Authorized JavaScript origins:**
   - `https://softnewsweb.netlify.app`
   - `http://localhost:5173` (development)
4. **Authorized redirect URIs:**
   - `https://softnewsweb.netlify.app`
   - `http://localhost:5173` (development)

## 🐙 3. GitHub OAuth Kurulumu

### 3.1 GitHub OAuth App
1. [GitHub Settings](https://github.com/settings/developers) → OAuth Apps
2. New OAuth App
3. **Application name:** `SoftNews`
4. **Homepage URL:** `https://softnewsweb.netlify.app`
5. **Authorization callback URL:** `https://softnewsweb.netlify.app/auth/github/callback`

## 🌐 4. Netlify Environment Variables

### 4.1 Netlify Dashboard
1. [Netlify](https://app.netlify.com) → Site → Site settings → Environment variables
2. Aşağıdaki değişkenleri ekleyin:

```bash
# JWT Secret
JWT_SECRET=L4jRYvriAczQJnCVWRy9KdNNOFBrauh0L9WDMWLOeUA=

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4.2 Local Development
1. `.env` dosyası oluşturun:
```bash
cp ENV_EXAMPLE .env
```

2. `.env` dosyasını düzenleyin:
```bash
# JWT Secret
JWT_SECRET=L4jRYvriAczQJnCVWRy9KdNNOFBrauh0L9WDMWLOeUA=

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

## 🚀 5. Deployment

### 5.1 Netlify Deployment
1. GitHub repository'yi Netlify'a bağlayın
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy!

### 5.2 Domain Ayarları
1. Netlify → Domain settings
2. Custom domain: `softnewsweb.netlify.app`
3. SSL certificate otomatik olarak oluşturulacak

## 🧪 6. Test Etme

### 6.1 Local Test
```bash
npm install
npm run dev
```

### 6.2 Production Test
1. https://softnewsweb.netlify.app adresine gidin
2. Kayıt ol/Giriş yap test edin
3. Sosyal medya girişlerini test edin
4. Şifre sıfırlama özelliğini test edin

## 🔧 7. Troubleshooting

### 7.1 Common Issues

**CORS Error:**
- Netlify Functions'da CORS headers kontrol edin
- Environment variables'ın doğru olduğundan emin olun

**Database Connection Error:**
- Supabase URL ve key'lerin doğru olduğundan emin olun
- Supabase project'in aktif olduğunu kontrol edin

**OAuth Error:**
- Redirect URI'lerin doğru olduğundan emin olun
- Client ID'lerin doğru olduğundan emin olun

### 7.2 Logs
- Netlify → Functions → View logs
- Supabase → Logs → API logs

## 📚 8. API Endpoints

### Authentication
- `POST /.netlify/functions/auth?action=register`
- `POST /.netlify/functions/auth?action=login`
- `GET /.netlify/functions/auth?action=verify`
- `PUT /.netlify/functions/auth?action=profile`

### Password Reset
- `POST /.netlify/functions/password-reset/request-reset`
- `GET /.netlify/functions/password-reset/verify-reset-token/{token}`
- `POST /.netlify/functions/password-reset/reset-password`

### Social Auth
- `POST /.netlify/functions/social-auth/google`
- `POST /.netlify/functions/social-auth/github`

## 🎉 Başarılı Kurulum!

Artık SoftNews uygulamanız tamamen çalışır durumda! Kullanıcılar:
- ✅ Kayıt olabilir
- ✅ Giriş yapabilir
- ✅ Sosyal medya ile giriş yapabilir
- ✅ Şifrelerini sıfırlayabilir
- ✅ Profillerini güncelleyebilir
- ✅ Gerçek veritabanında saklanır

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- GitHub Issues açın
- Email: ogulcandmr96@gmail.com
- Instagram: @ogulcan_dmr
