const NEWS_CACHE_KEY = 'softnews_articles_v1';
const NEWS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika cache

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
  // Check cache first
  const cached = loadNewsCache();
  if (cached) {
    return { ok: true, articles: cached };
  }

  try {
    const res = await fetch('/api/news', { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error('news request failed');
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'news error');
    
    const articles = (data.articles || []).map((a, idx) => ({
      id: idx + 1000,
      title: a.title || 'Başlık yok',
      description: a.description || a.content || '',
      image: a.urlToImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      category: categorizeArticle(a.title || '', a.description || ''),
      date: (a.publishedAt || '').slice(0, 10),
      url: a.url,
    }));
    
    // Save to cache
    saveNewsCache(articles);
    
    return { ok: true, articles };
  } catch (e) {
    return { ok: false, error: e?.message || 'news error' };
  }
}


