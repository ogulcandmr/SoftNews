// Vercel Serverless Function - News
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const provider = (process.env.NEWS_PROVIDER || 'gnews').toLowerCase();

  try {
    if (provider === 'gnews') {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      if (!GNEWS_API_KEY) return res.status(500).send('Missing GNEWS_API_KEY');
      
      const queries = [
        `https://gnews.io/api/v4/search?q=technology OR software OR AI OR hardware&lang=en&max=20&apikey=${encodeURIComponent(GNEWS_API_KEY)}`,
        `https://gnews.io/api/v4/search?q=teknoloji OR yazılım OR yapay zeka&lang=tr&max=15&apikey=${encodeURIComponent(GNEWS_API_KEY)}`
      ];
      
      let allArticles = [];
      for (const url of queries) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data?.articles) allArticles = allArticles.concat(data.articles);
        } catch (e) {
          console.error('Query failed:', e);
        }
      }
      
      const relevantArticles = allArticles.filter(article => {
        const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
        const excludeKeywords = ['crime', 'mahkeme', 'cinayet', 'court', 'arrest', 'prison', 'war'];
        return !excludeKeywords.some(kw => text.includes(kw));
      });
      
      const uniqueArticles = [];
      const seenUrls = new Set();
      
      for (const article of relevantArticles) {
        if (!seenUrls.has(article.url)) {
          uniqueArticles.push(article);
          seenUrls.add(article.url);
        }
      }
      
      const articles = uniqueArticles.slice(0, 30).map((a) => ({
        title: a?.title,
        description: a?.description,
        content: a?.description || 'Detaylı bilgi için kaynak linkini ziyaret edin.',
        url: a?.url,
        urlToImage: a?.image,
        publishedAt: a?.publishedAt,
        source: { name: a?.source?.name },
        category: 'Teknoloji',
        id: Math.random().toString(36).substr(2, 9),
      }));
      
      return res.status(200).json({ ok: true, articles });
    }

    return res.status(200).json({ ok: true, articles: [] });
  } catch (e) {
    return res.status(200).json({ ok: true, articles: [], fallback: true });
  }
}
