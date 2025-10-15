# 🚀 Vercel Deployment - FINAL (Netlify Functions ile)

## ✅ HAZIR! Kod Değişikliği YOK!

Vercel, Netlify functions'ları **DOĞRUDAN** destekliyor!
- ✅ Supabase çalışıyor
- ✅ Tüm functions aynı
- ✅ Hiçbir kod değişikliği yok

---

## 📋 Environment Variables (Vercel'e Ekle)

### Zorunlu:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GNEWS_API_KEY=your_gnews_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=softnews_secret_2024_xyz
```

### Opsiyonel:
```
YOUTUBE_API_KEY=your_youtube_key
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
AI_PROVIDER=groq
VITE_AI_PROVIDER=groq
VITE_AI_MODEL=llama-3.1-8b-instant
NEWS_PROVIDER=gnews
```

---

## 🚀 Deployment Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Vercel ready - Netlify functions supported"
git push
```

### 2. Vercel'e Git
- https://vercel.com
- Sign Up → GitHub ile giriş

### 3. New Project
- **Add New** → **Project**
- GitHub repo seç: **SoftNews**
- **Import**

### 4. Configure
- **Framework:** Vite (otomatik)
- **Root Directory:** `.` (boş bırak)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 5. Environment Variables
Yukarıdaki tüm değişkenleri ekle (özellikle SUPABASE!)

### 6. Deploy!
- **Deploy** butonuna bas
- 2-3 dakika bekle
- ✅ **Hazır!**

---

## 🎯 Nasıl Çalışıyor?

```
Frontend (Vercel)
    ↓
/api/news → /netlify/functions/news.js
/api/ai → /netlify/functions/ai.js
/api/forum → /netlify/functions/forum.js
    ↓
Supabase Database
```

**Netlify functions Vercel'de çalışıyor!**

---

## ✅ Özellikler

- ✅ **Haberler:** GNews API, 24h cache
- ✅ **AI:** Groq/OpenAI, rate limiting
- ✅ **YouTube:** YouTube Data API v3
- ✅ **Forum:** Supabase database
- ✅ **Auth:** Supabase + JWT
- ✅ **Social Auth:** Google, GitHub
- ✅ **Password Reset:** Email + JWT
- ✅ **Dark Mode:** Tam destek
- ✅ **Animasyonlar:** Mesh animations

**HİÇBİR ÖZELLİK DEĞİŞMEDİ!** 🎉

---

## 🐛 Sorun Giderme

### Functions çalışmıyor?
1. Vercel Dashboard → Functions → Logs
2. Environment variables kontrol et
3. SUPABASE_URL ve SUPABASE_ANON_KEY doğru mu?

### Build hatası?
```bash
npm run build
npm run preview
```

### Database bağlantı hatası?
- Supabase Dashboard'da proje aktif mi?
- API keys doğru mu?
- Tables oluşturulmuş mu? (users, topics, replies)

---

## 📊 Supabase Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### topics
```sql
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Genel',
  content TEXT,
  author TEXT DEFAULT 'guest',
  created_at TIMESTAMP DEFAULT NOW(),
  replies_count INT DEFAULT 0,
  last_reply_at TIMESTAMP,
  has_ai_reply BOOLEAN DEFAULT FALSE
);
```

### replies
```sql
CREATE TABLE replies (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id),
  content TEXT NOT NULL,
  author TEXT DEFAULT 'guest',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎉 Başarılı!

Site linki: `https://your-project.vercel.app`

**Tebrikler!** SoftNews Vercel'de, Supabase ile, tam özelliklerle yayında! 🚀

---

**NOT:** Netlify functions Vercel'de çalışıyor, hiçbir kod değişikliği yapmadık! ✅
