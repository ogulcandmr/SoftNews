// Vercel Serverless - News API
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
        'https://gnews.io/api/v4/search?q=technology OR software OR AI OR hardware&lang=en&max=20&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        'https://gnews.io/api/v4/search?q=teknoloji OR yazılım OR yapay zeka&lang=tr&max=10&apikey=' + encodeURIComponent(GNEWS_API_KEY)
      ];
      
      let allArticles = [];
      for (const url of queries) {
        try {
          console.log('Fetching from GNews:', url.substring(0, 80) + '...');
          const response = await fetch(url);
          console.log('GNews response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('GNews API error:', response.status, errorText);
            continue;
          }
          
          const data = await response.json();
          console.log('GNews API response:', data);
          
          if (data?.articles) {
            console.log('Articles from query:', data.articles.length);
            allArticles = allArticles.concat(data.articles);
          } else if (data?.errors) {
            console.error('GNews API errors:', data.errors);
          }
        } catch (e) {
          console.error('Query failed:', e.message);
        }
      }
      
      console.log('Total articles before filter:', allArticles.length);
      
      const relevantArticles = allArticles.filter(article => {
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        const text = title + ' ' + desc;
        
        // Exclude non-tech content
        const excludeKeywords = [
          'crime', 'mahkeme', 'cinayet', 'öldür', 'court', 'arrest', 'prison',
          'election', 'seçim', 'war', 'savaş', 'covid', 'vaccine', 'aşı',
          'recipe', 'yemek', 'tarif', 'spor', 'sport', 'futbol', 'football',
          'mahrem', 'cinsel', 'scandal', 'skandal', 'polis', 'police'
        ];
        if (excludeKeywords.some(kw => text.includes(kw))) return false;
        
        return true;
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
