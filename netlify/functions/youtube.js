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
  {
    id: '1Rs2ND1ryYc',
    title: 'Oyun Programlama Temelleri',
    url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
    embedUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
    category: 'Oyun',
    duration: '25:10',
    views: 4100000,
    description: 'Unity ile oyun geliştirmeye giriş',
    aiRecommended: false,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/mqdefault.jpg' } },
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Web Geliştirme 2024 Trendleri',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Yazılım',
    duration: '20:30',
    views: 1500000,
    description: 'Modern web geliştirme teknolojileri ve trendleri',
    aiRecommended: true,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' } },
  },
  {
    id: 'GxxQf0k7M9E',
    title: 'Donanım ve IoT Projeleri',
    url: 'https://www.youtube.com/watch?v=GxxQf0k7M9E',
    embedUrl: 'https://www.youtube.com/embed/GxxQf0k7M9E',
    category: 'Donanım',
    duration: '16:20',
    views: 890000,
    description: 'Arduino ve Raspberry Pi ile IoT projeleri',
    aiRecommended: false,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/GxxQf0k7M9E/mqdefault.jpg' } },
  },
  {
    id: 'uHYD9cF27WU',
    title: 'LLM’ler Nasıl Çalışır? (Derinlemesine)',
    url: 'https://www.youtube.com/watch?v=uHYD9cF27WU',
    embedUrl: 'https://www.youtube.com/embed/uHYD9cF27WU',
    category: 'Yapay Zeka',
    duration: '28:10',
    views: 2100000,
    description: 'Büyük dil modellerinin mimarisi ve eğitim süreçleri',
    aiRecommended: true,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/uHYD9cF27WU/mqdefault.jpg' } },
  },
  {
    id: 'f02mOEt11OQ',
    title: 'TypeScript En İyi Uygulamalar',
    url: 'https://www.youtube.com/watch?v=f02mOEt11OQ',
    embedUrl: 'https://www.youtube.com/embed/f02mOEt11OQ',
    category: 'Yazılım',
    duration: '19:55',
    views: 980000,
    description: 'TS ile daha güvenli ve ölçeklenebilir kod yazma',
    aiRecommended: false,
    thumbnails: { medium: { url: 'https://i.ytimg.com/vi/f02mOEt11OQ/mqdefault.jpg' } },
  },
];

function categorizeVideo(title = '', description = '') {
  const t = `${title} ${description}`.toLowerCase();
  if (/yapay zeka|ai|gpt|llm|machine learning|ml|deep learning/.test(t)) return 'Yapay Zeka';
  if (/donanım|hardware|gpu|cpu|işlemci|ekran kartı|ram|ssd|anakart|raspberry|arduino|iot/.test(t)) return 'Donanım';
  if (/oyun|gaming|playstation|xbox|steam|unity|unreal/.test(t)) return 'Oyun';
  if (/yazılım|software|typescript|javascript|react|vue|angular|node|python|golang|java|kotlin|c\+\+|c#/.test(t)) return 'Yazılım';
  if (/startup|girişim|vc|yatırım|funding|exit|scaleup/.test(t)) return 'Startup';
  if (/mobil|android|ios|iphone|telefon|uygulama/.test(t)) return 'Mobil';
  return 'Teknoloji';
}

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
  if (!searchRes.ok) {
    // Fall back gracefully on API errors like 403/429
    return { ok: true, source: `fallback_api_error_${searchRes.status}`, items: FALLBACK_VIDEOS };
  }
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
  if (!detailsRes.ok) {
    // Build minimal items from search when details fail
    const items = searchData.items.map((s) => ({
      id: s.id.videoId,
      title: s.snippet.title,
      description: s.snippet.description,
      url: `https://www.youtube.com/watch?v=${s.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${s.id.videoId}`,
      thumbnails: s.snippet.thumbnails,
      durationISO8601: null,
      views: 0,
      category: 'Teknoloji',
      aiRecommended: false,
    }));
    return { ok: true, source: `partial_fallback_${detailsRes.status}`, items };
  }
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
    category: categorizeVideo(v.snippet.title, v.snippet.description),
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
    // Absolute fallback on unexpected errors
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, source: 'fallback_exception', items: FALLBACK_VIDEOS }) };
  }
};
