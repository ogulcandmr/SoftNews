// Vercel Serverless - News API (Netlify'den tam kopya)
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const provider = (process.env.NEWS_PROVIDER || 'gnews').toLowerCase();

  try {
    if (provider === 'gnews') {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      if (!GNEWS_API_KEY) return res.status(500).send('Missing GNEWS_API_KEY');
      
      const queries = [
        'https://gnews.io/api/v4/search?q=technology software AI hardware programming&lang=en&max=30&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        'https://gnews.io/api/v4/search?q=teknoloji yazılım yapay zeka programlama&lang=tr&max=20&apikey=' + encodeURIComponent(GNEWS_API_KEY)
      ];
      
      let allArticles = [];
      for (const url of queries) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log('GNews API response:', data);
          if (data?.articles) {
            console.log('Articles from query:', data.articles.length);
            allArticles = allArticles.concat(data.articles);
          }
        } catch (e) {
          console.error('Query failed:', e);
        }
      }
      
      console.log('Total articles before filter:', allArticles.length);
      
      const relevantArticles = allArticles.filter(article => {
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        const text = title + ' ' + desc;
        
        // HARD EXCLUDE - Kesinlikle istemediğimiz konular
        const hardExclude = [
          'mahrem', 'cinsel', 'sexual', 'porn', 'nude', 'scandal', 'skandal',
          'taciz', 'tecavüz', 'rape', 'abuse', 'harassment', 'ihbar',
          'cinayet', 'murder', 'öldür', 'kill', 'ölüm', 'death', 'öldü', 'died',
          'mahkeme', 'court', 'dava', 'lawsuit', 'arrest', 'tutukla', 'prison', 'hapishane',
          'polis', 'police', 'savcı', 'prosecutor', 'suç', 'crime',
          'dolandır', 'fraud', 'scam', 'hırsız', 'theft', 'çaldı', 'steal',
          'kaza', 'accident', 'crash', 'yaralı', 'injured', 'hastane', 'hospital',
          'seçim', 'election', 'vote', 'savaş', 'war', 'conflict', 'çatışma',
          'terör', 'terror', 'bomba', 'bomb', 'silah', 'weapon', 'gun',
          'spor', 'sport', 'futbol', 'football', 'basketbol', 'basketball',
          'yemek', 'recipe', 'tarif', 'mutfak', 'kitchen', 'food',
          'sağlık', 'health', 'hastalık', 'disease', 'covid', 'vaccine', 'aşı',
          'diş hekimi', 'dentist', 'doktor', 'doctor', 'hasta', 'patient'
        ];
        if (hardExclude.some(kw => text.includes(kw))) return false;
        
        // CORE TECH - Gerçek teknoloji haberleri (en az 2 keyword olmalı)
        const coreTechKeywords = [
          // Teknoloji genel
          'technology', 'teknoloji', 'tech', 'innovation', 'yenilik',
          // Yazılım & Kodlama
          'software', 'yazılım', 'programming', 'programlama', 'code', 'kod',
          'developer', 'geliştirici', 'app', 'uygulama', 'platform',
          // AI & ML
          'ai', 'artificial intelligence', 'yapay zeka', 'machine learning',
          'chatgpt', 'openai', 'llm', 'model', 'neural', 'deep learning',
          // Donanım
          'hardware', 'donanım', 'chip', 'çip', 'processor', 'işlemci',
          'gpu', 'cpu', 'semiconductor', 'yarıiletken',
          // Mobil & Cihazlar
          'smartphone', 'iphone', 'android', 'mobile', 'mobil', 'tablet',
          'laptop', 'computer', 'bilgisayar', 'pc', 'mac',
          // Şirketler (büyük tech)
          'apple', 'google', 'microsoft', 'meta', 'amazon', 'tesla',
          'nvidia', 'samsung', 'intel', 'amd', 'qualcomm', 'spacex',
          // Yeni teknolojiler
          'robot', 'drone', 'vr', 'ar', 'metaverse', 'blockchain',
          'crypto', 'bitcoin', 'ethereum', 'nft', 'web3',
          // Oyun
          'gaming', 'oyun', 'game', 'playstation', 'xbox', 'nintendo',
          'steam', 'esports', 'twitch'
        ];
        
        const techMatches = coreTechKeywords.filter(kw => text.includes(kw)).length;
        
        // En az 1 tech keyword olmalı
        return techMatches >= 1;
      });
      
      console.log('Articles after filter:', relevantArticles.length);
      
      const uniqueArticles = [];
      const seenUrls = new Set();
      const seenTitles = new Set();
      
      for (const article of relevantArticles) {
        if (seenUrls.has(article.url)) continue;
        
        const normalizedTitle = (article.title || '').toLowerCase().trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ');
        
        let isDuplicate = false;
        for (const seenTitle of seenTitles) {
          const words1 = normalizedTitle.split(' ').filter(w => w.length > 3);
          const words2 = seenTitle.split(' ').filter(w => w.length > 3);
          const commonWords = words1.filter(w => words2.includes(w)).length;
          const similarity = commonWords / Math.max(words1.length, words2.length, 1);
          
          if (similarity > 0.7) {
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {
          uniqueArticles.push(article);
          seenUrls.add(article.url);
          seenTitles.add(normalizedTitle);
        }
      }
      
      uniqueArticles.sort((a, b) => {
        const aTurkish = (a.title || '').match(/[çğıöşüÇĞİÖŞÜ]/) ? 2 : 0;
        const bTurkish = (b.title || '').match(/[çğıöşüÇĞİÖŞÜ]/) ? 2 : 0;
        
        const qualitySources = ['techcrunch', 'wired', 'theverge', 'engadget', 'arstechnica', 'reuters', 'bloomberg', 'cnn', 'bbc', 'forbes', 'wsj', 'nytimes', 'guardian', 'shiftdelete', 'webtekno', 'donanimhaber'];
        const aQuality = qualitySources.some(source => a.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
        const bQuality = qualitySources.some(source => b.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
        
        return (bTurkish + bQuality) - (aTurkish + aQuality);
      }).slice(0, 60);
      
      const articles = uniqueArticles.map((a) => ({
        title: a?.title,
        description: a?.description,
        content: a?.description || 'Bu haber hakkında daha detaylı bilgi için kaynak linkini ziyaret edebilirsiniz.',
        url: a?.url,
        urlToImage: a?.image,
        publishedAt: a?.publishedAt,
        source: { name: a?.source?.name },
        category: 'Teknoloji',
        id: Math.random().toString(36).substr(2, 9),
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).json({ ok: true, articles });
    }

    // Fallback
    const fallbackArticles = [
      {
        title: "Teknoloji Dünyasında Son Gelişmeler",
        description: "Yapay zeka ve yazılım geliştirme alanında önemli gelişmeler yaşanıyor.",
        url: "https://example.com",
        urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        publishedAt: new Date().toISOString(),
        source: { name: "SoftNews" },
        category: "Teknoloji"
      }
    ];
    
    return res.status(200).json({ 
      ok: true, 
      articles: fallbackArticles,
      fallback: true
    });
  } catch (e) {
    const fallbackArticles = [
      {
        title: "Teknoloji Dünyasında Son Gelişmeler",
        description: "Yapay zeka ve yazılım geliştirme alanında önemli gelişmeler yaşanıyor.",
        url: "https://example.com",
        urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        publishedAt: new Date().toISOString(),
        source: { name: "SoftNews" },
        category: "Teknoloji"
      }
    ];
    
    return res.status(200).json({ 
      ok: true, 
      articles: fallbackArticles,
      fallback: true,
      error: e?.message || 'API quota exceeded'
    });
  }
}
