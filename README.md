# SoftNews

Yazılım ve teknoloji haberleri, videoları ve forumu içeren modern bir haber sitesi projesi.

## Kurulum

1. Bağımlılıkları yükle:
   ```bash
   npm install
   ```
2. Geliştirme sunucusunu başlat:
   ```bash
   npm run dev
   ```
3. Tarayıcıda aç:
   - [http://localhost:5173](http://localhost:5173)

## Özellikler
- Kayıt ve giriş sistemi (localStorage tabanlı)
- Kategoriler, haberler, videolar ve forum sayfaları
- Modern ve responsive arayüz (Tailwind, Bootstrap, MDBReact)

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
