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
      const urlTR = `https://gnews.io/api/v4/top-headlines?lang=tr&topic=technology&max=12&apikey=${encodeURIComponent(GNEWS_API_KEY)}`;
      const res = await fetch(urlTR);
      const data = await res.json();
      // Normalize to articles[] format similar to NewsAPI
      const articles = (data?.articles || []).map((a) => ({
        title: a?.title,
        description: a?.description,
        url: a?.url,
        urlToImage: a?.image,
        publishedAt: a?.publishedAt,
        source: { name: a?.source?.name },
      }));
      return { statusCode: 200, body: JSON.stringify({ ok: true, articles }) };
    }

    if (provider === 'trhaberler') {
      // Free TR source via RSS (hurriyet.com.tr/son-dakika/), parse on server
      const rssUrl = 'https://www.hurriyet.com.tr/rss/sondakika.rss';
      const res = await fetch(rssUrl);
      const text = await res.text();
      
      // Simple XML parsing without external library
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(text)) && items.length < 12) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
        
        if (titleMatch) {
          items.push({
            title: titleMatch[1].trim(),
            description: descMatch ? descMatch[1].trim() : '',
            url: linkMatch ? linkMatch[1].trim() : '',
            urlToImage: undefined,
            publishedAt: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
            source: { name: 'Hürriyet' },
            category: 'Güncel',
            id: items.length + 10000,
          });
        }
      }
      
      return { statusCode: 200, body: JSON.stringify({ ok: true, articles: items }) };
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


