exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const provider = (process.env.NEWS_PROVIDER || 'newsapi').toLowerCase();

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

    // default: newsapi
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      return { statusCode: 500, body: 'Missing NEWS_API_KEY' };
    }
    const q = 'technology OR software OR AI';
    const urlTop = `https://newsapi.org/v2/top-headlines?language=tr&category=technology&pageSize=12&q=${encodeURIComponent(q)}`;
    const res = await fetch(urlTop, { headers: { 'X-Api-Key': NEWS_API_KEY } });
    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, articles: data?.articles || [] }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message || 'news error' }) };
  }
};


