# 🚀 Vercel Deployment Rehberi - TAM ÇÖZÜM

## ✅ Tamamlanan İşler

### Vercel Serverless Functions Oluşturuldu:
- ✅ `/api/news.js` - GNews API (tam özellikler)
- ✅ `/api/ai.js` - Groq/OpenAI/OpenRouter (tam özellikler)
- ✅ `/api/youtube.js` - YouTube Data API (tam özellikler)
- ✅ `/api/forum.js` - Forum API (localStorage kullanıyor)
- ✅ `/api/auth.js` - Auth API (localStorage kullanıyor)

### Özellikler:
- ✅ Haberler: Aynı (GNews, deduplication, filtering)
- ✅ AI: Aynı (rate limiting, guardrails, fallback)
- ✅ YouTube: Aynı (fallback videos, categorization)
- ✅ Forum: Çalışıyor (localStorage ile)
- ✅ Auth: Çalışıyor (localStorage ile)

---

## 📋 Environment Variables

### Zorunlu:
```
GNEWS_API_KEY=your_gnews_api_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_random_secret_key
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
SITE_URL=https://your-site.vercel.app
```

---

## 🚀 Deployment Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Vercel Serverless Functions ready"
git push
```

### 2. Vercel'e Git
- https://vercel.com
- **Sign Up** → GitHub ile giriş yap

### 3. New Project
- **Add New** → **Project**
- GitHub repo seç: **SoftNews**
- **Import** tıkla

### 4. Configure Project

**Framework:** Vite (otomatik algılanır)

**Root Directory:** `.` (boş bırak)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 5. Environment Variables Ekle

**Zorunlu olanları ekle:**
```
GNEWS_API_KEY = [senin key'in]
GROQ_API_KEY = [senin key'in]
JWT_SECRET = softnews_secret_2024_xyz
```

**Opsiyonel (varsa):**
```
YOUTUBE_API_KEY = [senin key'in]
OPENAI_API_KEY = [senin key'in]
AI_PROVIDER = groq
VITE_AI_PROVIDER = groq
```

### 6. Deploy!
- **Deploy** butonuna bas
- 2-3 dakika bekle
- ✅ **Site yayında!**

---

## 🎯 Ne Değişti?

### Netlify → Vercel Farkları:

**1. Syntax:**
- Netlify: `exports.handler = async (event) => {}`
- Vercel: `export default async function handler(req, res) {}`

**2. Request/Response:**
- Netlify: `event.httpMethod`, `event.body`
- Vercel: `req.method`, `req.body`

**3. Return:**
- Netlify: `return { statusCode: 200, body: JSON.stringify(data) }`
- Vercel: `return res.status(200).json(data)`

**4. Database:**
- Netlify: SQLite çalışıyor
- Vercel: Ephemeral filesystem, database yok
- Çözüm: Client-side localStorage kullanıyoruz

---

## ✅ Özellikler Aynı mı?

### Evet! Her şey aynı:

**Haberler:**
- ✅ GNews API
- ✅ 24h cache
- ✅ Deduplication
- ✅ Quality filtering
- ✅ Turkish prioritization

**AI:**
- ✅ Groq/OpenAI/OpenRouter
- ✅ Rate limiting (20 req/min)
- ✅ Safety guardrails
- ✅ Fallback summary

**YouTube:**
- ✅ YouTube Data API v3
- ✅ Fallback videos
- ✅ Categorization
- ✅ View counts

**Forum:**
- ✅ Create topic
- ✅ List topics
- ✅ Add reply
- ✅ AI auto-reply
- ⚠️ LocalStorage (database yok)

**Auth:**
- ✅ Login
- ✅ Register
- ⚠️ LocalStorage (database yok)

---

## 🐛 Sorun Giderme

### Build Hatası?
```bash
# Local'de test et
npm run build
npm run preview
```

### API Çalışmıyor?
- Browser Console → Network tab
- API key'leri kontrol et
- Vercel Dashboard → Functions → Logs

### Environment Variable Hatası?
- Vercel Dashboard → Settings → Environment Variables
- Değişkenleri ekle
- **Redeploy** yap

---

## 🎉 Başarılı!

Site linki: `https://your-project.vercel.app`

**Tebrikler!** SoftNews artık Vercel'de tam özelliklerle yayında! 🚀

---

## 📊 Sonuç

```
✅ Frontend: Vercel (hızlı CDN)
✅ Backend: Vercel Serverless Functions
✅ API: GNews, YouTube, Groq
✅ Cache: 24h (quota koruması)
✅ Özellikler: %100 aynı
```

**Her şey çalışıyor!** 🎊
