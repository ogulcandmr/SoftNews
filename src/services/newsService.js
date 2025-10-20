const NEWS_CACHE_KEY = 'softnews_articles_v25'; // v25 - Merge old + new articles
const OLD_NEWS_KEY = 'softnews_old_articles'; // Eski haberler için ayrı key
const NEWS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat = günde 1 API çağrısı
const MIN_ARTICLES = 30; // Minimum haber sayısı

// Check if cache is from today
function isCacheFromToday(timestamp) {
  const cacheDate = new Date(timestamp);
  const today = new Date();
  return cacheDate.getDate() === today.getDate() &&
         cacheDate.getMonth() === today.getMonth() &&
         cacheDate.getFullYear() === today.getFullYear();
}

function loadNewsCache() {
  try {
    // FORCE CLEAR OLD CACHE
    const oldKeys = ['softnews_articles_v1', 'softnews_articles_v2', 'softnews_articles_v3', 
                     'softnews_articles_v4', 'softnews_articles_v5', 'softnews_articles_v6',
                     'softnews_articles_v7', 'softnews_articles_v8', 'softnews_articles_v9',
                     'softnews_articles_v10', 'softnews_articles_v11', 'softnews_articles_v12',
                     'softnews_articles_v13', 'softnews_articles_v14', 'softnews_articles_v15',
                     'softnews_articles_v16', 'softnews_articles_v17', 'softnews_articles_v18',
                     'softnews_articles_v19', 'softnews_articles_v19_fresh', 'softnews_articles_v20_clean',
                     'softnews_articles_v21', 'softnews_articles_v22', 'softnews_articles_v23', 'softnews_articles_v24'];
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.articles || !parsed?.timestamp) return null;
    
    // Check if cache is from today
    if (!isCacheFromToday(parsed.timestamp)) {
      console.log('Cache is from previous day, clearing...');
      localStorage.removeItem(NEWS_CACHE_KEY);
      return null;
    }
    
    return parsed.articles;
  } catch {
    return null;
  }
}

function saveNewsCache(articles) {
  try {
    // Yeni haberleri kaydet
    localStorage.setItem(
      NEWS_CACHE_KEY,
      JSON.stringify({ articles, timestamp: Date.now() })
    );
    
    // Eski haberleri de sakla (birleştirme için)
    const oldArticles = loadOldNewsCache() || [];
    const combined = [...articles, ...oldArticles]
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .slice(0, 50); // En fazla 50 haber sakla
    
    localStorage.setItem(
      OLD_NEWS_KEY,
      JSON.stringify({ articles: combined, timestamp: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}

function loadOldNewsCache() {
  try {
    const raw = localStorage.getItem(OLD_NEWS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.articles || null;
  } catch {
    return null;
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
  console.log('Fetching news...');
  
  // CACHE AKTIF - 24 saat boyunca aynı haberler
  const cached = loadNewsCache();
  if (cached) {
    console.log('Using cached news (24h):', cached.length);
    return { ok: true, articles: cached };
  }

  console.log('Cache expired or empty, fetching fresh news...');
  
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
    console.log('API response headers:', res.headers);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API request failed:', res.status, res.statusText, errorText);
      throw new Error(`news request failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    console.log('Articles received:', data?.articles?.length);
    
    if (!data?.ok) {
      console.error('API returned error:', data?.error);
      throw new Error(data?.error || 'news error');
    }
    
    const articles = (data.articles || []).map((a, idx) => ({
      id: idx + 1000,
      title: a.title || 'Başlık yok',
      description: a.description || a.content || '',
      content: a.content || a.description || '',
      image: a.urlToImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      category: categorizeArticle(a.title || '', a.description || ''),
      date: (a.publishedAt || '').slice(0, 10),
      url: a.url,
      source: a.source || { name: 'SoftNews' },
    }));
    
      console.log('Processed articles:', articles.length);
      
      // Eğer yeni haberler yeterli değilse, eski haberlerle birleştir
      let finalArticles = articles;
      if (articles.length < MIN_ARTICLES) {
        console.log(`Only ${articles.length} new articles, merging with old news...`);
        const oldArticles = loadOldNewsCache() || [];
        console.log('Old articles available:', oldArticles.length);
        
        // Yeni + eski haberleri birleştir (duplicate'leri çıkar)
        const combined = [...articles, ...oldArticles]
          .filter((article, index, self) => 
            index === self.findIndex(a => a.url === article.url)
          )
          .slice(0, 40); // En fazla 40 haber göster
        
        finalArticles = combined;
        console.log('Combined articles (new + old):', finalArticles.length);
      }
      
      // CACHE KAYDET - Sadece haber varsa kaydet
      if (finalArticles.length > 0) {
        saveNewsCache(finalArticles);
        console.log('Articles cached for 24 hours:', finalArticles.length);
      } else {
        console.warn('No articles to cache!');
      }
      
      return { ok: true, articles: finalArticles };
  } catch (e) {
    console.error('News fetch error:', e);
    return { ok: false, error: e?.message || 'news error' };
  }
}


