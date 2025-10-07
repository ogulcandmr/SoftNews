exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const provider = (process.env.NEWS_PROVIDER || 'trhaberler').toLowerCase();

  try {
    if (provider === 'gnews') {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      if (!GNEWS_API_KEY) {
        return { statusCode: 500, body: 'Missing GNEWS_API_KEY' };
      }
      // Try multiple queries to get better Turkish tech news
      const queries = [
        'https://gnews.io/api/v4/search?q=teknoloji&lang=tr&max=4&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        'https://gnews.io/api/v4/search?q=yazılım&lang=tr&max=4&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        'https://gnews.io/api/v4/search?q=yapay zeka&lang=tr&max=4&apikey=' + encodeURIComponent(GNEWS_API_KEY)
      ];
      
      let allArticles = [];
      for (const url of queries) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data?.articles) {
            allArticles = allArticles.concat(data.articles);
          }
        } catch (e) {
          // Continue with next query
        }
      }
      
      // Remove duplicates and limit to 12
      const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      ).slice(0, 12);
      
      const articles = uniqueArticles.map((a) => ({
        title: a?.title,
        description: a?.description,
        url: a?.url,
        urlToImage: a?.image,
        publishedAt: a?.publishedAt,
        source: { name: a?.source?.name },
        category: 'Teknoloji',
        id: Math.random().toString(36).substr(2, 9),
      }));
      
      return { statusCode: 200, body: JSON.stringify({ ok: true, articles }) };
    }

    if (provider === 'trhaberler') {
      // Fallback to GNews if RSS fails
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      if (GNEWS_API_KEY) {
        try {
          const urlTR = `https://gnews.io/api/v4/top-headlines?lang=tr&topic=technology&max=12&apikey=${encodeURIComponent(GNEWS_API_KEY)}`;
          const res = await fetch(urlTR);
          const data = await res.json();
          const articles = (data?.articles || []).map((a) => ({
            title: a?.title,
            description: a?.description,
            url: a?.url,
            urlToImage: a?.image,
            publishedAt: a?.publishedAt,
            source: { name: a?.source?.name },
          }));
          return { statusCode: 200, body: JSON.stringify({ ok: true, articles }) };
        } catch (e) {
          // Fall through to dummy data
        }
      }
      
      // Dummy data as last resort
      const dummyArticles = [
        {
          title: 'Yapay Zeka ile Kodlama Devrimi',
          description: 'Yapay zeka destekli araçlar yazılım geliştirmede devrim yaratıyor.',
          url: 'https://example.com/1',
          urlToImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
          publishedAt: new Date().toISOString(),
          source: { name: 'SoftNews' },
          category: 'Teknoloji',
          id: 10001,
        },
        {
          title: 'Yeni Nesil Mobil İşlemciler',
          description: 'Mobil cihazlarda performans ve enerji verimliliği yeni nesil işlemcilerle zirveye çıkıyor.',
          url: 'https://example.com/2',
          urlToImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
          publishedAt: new Date().toISOString(),
          source: { name: 'SoftNews' },
          category: 'Donanım',
          id: 10002,
        },
        {
          title: 'Oyun Dünyasında Büyük Yenilik',
          description: 'Oyun motorları ve grafik teknolojilerindeki gelişmeler, oyun deneyimini bambaşka bir seviyeye taşıyor.',
          url: 'https://example.com/3',
          urlToImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          publishedAt: new Date().toISOString(),
          source: { name: 'SoftNews' },
          category: 'Oyun',
          id: 10003,
        }
      ];
      
      return { statusCode: 200, body: JSON.stringify({ ok: true, articles: dummyArticles }) };
    }

    // default: newsapi
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      return { statusCode: 500, body: 'Missing NEWS_API_KEY' };
    }
    const q = 'technology OR software OR AI';
    const urlTop = `https://newsapi.org/v2/top-headlines?language=tr&category=technology&pageSize=12&q=${encodeURIComponent(q)}`;
    let res = await fetch(urlTop, { headers: { 'X-Api-Key': NEWS_API_KEY } });
    let data = await res.json();
    if (!Array.isArray(data?.articles) || data.articles.length === 0) {
      // Fallback: broader search if top-headlines is empty in TR
      const urlEverything = `https://newsapi.org/v2/everything?language=tr&q=${encodeURIComponent('teknoloji OR yazılım OR yapay zeka')}&sortBy=publishedAt&pageSize=12`;
      res = await fetch(urlEverything, { headers: { 'X-Api-Key': NEWS_API_KEY } });
      data = await res.json();
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, articles: data?.articles || [] }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message || 'news error' }) };
  }
};


