// netlify/functions/youtube.js

const YT_API_URL = 'https://www.googleapis.com/youtube/v3';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };
}

const FALLBACK_VIDEOS = [
  {
    id: 'MB26JRTbdKE',
    title: 'Yapay Zeka ile Kodlama Devrimi',
    url: 'https://www.youtube.com/watch?v=MB26JRTbdKE',
    embedUrl: 'https://www.youtube.com/embed/MB26JRTbdKE',
    category: 'Yapay Zeka',
    duration: '15:30',
    views: 2500000,
    description: 'Yapay zeka teknolojilerinin yazılım geliştirme süreçlerine etkisi',
    aiRecommended: true,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/MB26JRTbdKE/mqdefault.jpg' } },
  },
  {
    id: 'hc-yBuo057E',
    title: 'Teknoloji Girişimleri ve Startup Dünyası',
    url: 'https://www.youtube.com/watch?v=hc-yBuo057E',
    embedUrl: 'https://www.youtube.com/embed/hc-yBuo057E',
    category: 'Startup',
    duration: '22:15',
    views: 1800000,
    description: 'Başarılı teknoloji girişimlerinin hikayeleri ve ipuçları',
    aiRecommended: false,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/hc-yBuo057E/mqdefault.jpg' } },
  },
  {
    id: '2Ji-clqUYnA',
    title: 'Mobil Uygulama Geliştirme Rehberi',
    url: 'https://www.youtube.com/watch?v=2Ji-clqUYnA',
    embedUrl: 'https://www.youtube.com/embed/2Ji-clqUYnA',
    category: 'Mobil',
    duration: '18:45',
    views: 3200000,
    description: 'React Native ile mobil uygulama geliştirme süreci',
    aiRecommended: true,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/2Ji-clqUYnA/mqdefault.jpg' } },
  },
];

async function fetchYouTube(query, maxResults = 9) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return { ok: true, source: 'fallback', items: FALLBACK_VIDEOS };
  }
  // Step 1: search
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    maxResults: String(maxResults),
    type: 'video',
    safeSearch: 'moderate',
    relevanceLanguage: 'tr',
    key,
  });
  const searchRes = await fetch(`${YT_API_URL}/search?${searchParams.toString()}`);
  if (!searchRes.ok) throw new Error(`YouTube search failed: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const ids = searchData.items.map((i) => i.id.videoId).filter(Boolean);
  if (!ids.length) return { ok: true, source: 'empty', items: [] };

  // Step 2: details
  const detailsParams = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: ids.join(','),
    key,
  });
  const detailsRes = await fetch(`${YT_API_URL}/videos?${detailsParams.toString()}`);
  if (!detailsRes.ok) throw new Error(`YouTube details failed: ${detailsRes.status}`);
  const detailsData = await detailsRes.json();

  const items = detailsData.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube.com/embed/${v.id}`,
    thumbnails: v.snippet.thumbnails,
    durationISO8601: v.contentDetails.duration,
    views: Number(v.statistics?.viewCount || 0),
    category: 'Teknoloji',
    aiRecommended: false,
  }));
  return { ok: true, source: 'youtube', items };
}

exports.handler = async (event) => {
  const headers = corsHeaders();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const q = new URLSearchParams(event.queryStringParameters || {}).get('q') || 'teknoloji haberleri';
  try {
    const data = await fetchYouTube(q, 9);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e?.message || 'youtube error' }) };
  }
};
