const NEWS_CACHE_KEY = 'softnews_articles_v1';
const NEWS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün cache - haftada sadece 1 kez çek

function loadNewsCache() {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.articles || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > NEWS_CACHE_TTL_MS) return null;
    return parsed.articles;
  } catch {
    return null;
  }
}

function saveNewsCache(articles) {
  try {
    localStorage.setItem(
      NEWS_CACHE_KEY,
      JSON.stringify({ articles, timestamp: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}

function categorizeArticle(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('yapay zeka') || text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
    return 'Yapay Zeka';
  }
  if (text.includes('donanım') || text.includes('hardware') || text.includes('işlemci') || text.includes('ekran kartı') || text.includes('ram')) {
    return 'Donanım';
  }
  if (text.includes('oyun') || text.includes('game') || text.includes('gaming') || text.includes('playstation') || text.includes('xbox')) {
    return 'Oyun';
  }
  if (text.includes('yazılım') || text.includes('software') || text.includes('program') || text.includes('kod') || text.includes('developer')) {
    return 'Yazılım';
  }
  if (text.includes('startup') || text.includes('girişim') || text.includes('şirket') || text.includes('company') || text.includes('finansman')) {
    return 'Startup';
  }
  if (text.includes('mobil') || text.includes('telefon') || text.includes('smartphone') || text.includes('android') || text.includes('ios')) {
    return 'Mobil';
  }
  return 'Teknoloji'; // default
}

export async function fetchLatestNews() {
  // Temporarily disable cache to ensure news loads
  // const cached = loadNewsCache();
  // if (cached) {
  //   console.log('Using cached news data');
  //   return { ok: true, articles: cached };
  // }
  
  console.log('Fetching fresh news...');

  try {
    console.log('Making API request to /api/news...');
    const res = await fetch('/api/news', { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });
    
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      console.error('API request failed:', res.status, res.statusText);
      throw new Error(`news request failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    
    if (!data?.ok) {
      console.error('API returned error:', data?.error);
      throw new Error(data?.error || 'news error');
    }
    
    const articles = (data.articles || []).map((a, idx) => ({
      id: idx + 1000,
      title: a.title || 'Başlık yok',
      description: a.description || a.content || '',
      image: a.urlToImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      category: categorizeArticle(a.title || '', a.description || ''),
      date: (a.publishedAt || '').slice(0, 10),
      url: a.url,
    }));
    
    console.log('Processed articles:', articles.length);
    
    // Save to cache
    saveNewsCache(articles);
    
    return { ok: true, articles };
  } catch (e) {
    console.error('News fetch error:', e);
    return { ok: false, error: e?.message || 'news error' };
  }
}


