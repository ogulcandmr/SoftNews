// Vercel Serverless Function - YouTube
const FALLBACK_VIDEOS = [
  {
    id: 'MB26JRTbdKE',
    title: 'Yapay Zeka ile Kodlama',
    url: 'https://www.youtube.com/watch?v=MB26JRTbdKE',
    embedUrl: 'https://www.youtube.com/embed/MB26JRTbdKE',
    category: 'Yapay Zeka',
    views: 2500000,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/MB26JRTbdKE/mqdefault.jpg' } },
  },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const q = req.query.q || 'teknoloji haberleri';
  const max = Math.min(50, Number(req.query.max || 9));
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return res.status(200).json({ ok: true, source: 'fallback', items: FALLBACK_VIDEOS });
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=${max}&key=${key}&relevanceLanguage=tr`;
    const searchRes = await fetch(searchUrl);
    
    if (!searchRes.ok) {
      return res.status(200).json({ ok: true, source: 'fallback', items: FALLBACK_VIDEOS });
    }

    const searchData = await searchRes.json();
    const items = (searchData.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      thumbnails: item.snippet.thumbnails,
      category: 'Teknoloji',
    }));

    return res.status(200).json({ ok: true, source: 'youtube', items });
  } catch (e) {
    return res.status(200).json({ ok: true, source: 'fallback', items: FALLBACK_VIDEOS });
  }
}
