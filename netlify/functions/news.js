exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const provider = (process.env.NEWS_PROVIDER || 'gnews').toLowerCase();

  try {
    if (provider === 'gnews') {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      if (!GNEWS_API_KEY) {
        return { statusCode: 500, body: 'Missing GNEWS_API_KEY' };
      }
      // Optimized queries - ONLY tech sources and topics
      const queries = [
        // AI and Software
        'https://gnews.io/api/v4/search?q=artificial intelligence OR machine learning OR ChatGPT OR OpenAI&lang=en&max=15&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        // Software Development
        'https://gnews.io/api/v4/search?q=software development OR programming OR GitHub OR developer&lang=en&max=12&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        // Gaming and hardware
        'https://gnews.io/api/v4/search?q=gaming OR GPU OR NVIDIA OR AMD OR Intel processor&lang=en&max=10&apikey=' + encodeURIComponent(GNEWS_API_KEY),
        // Startup and tech companies
        'https://gnews.io/api/v4/search?q=tech startup OR venture capital OR tech company OR IPO&lang=en&max=8&apikey=' + encodeURIComponent(GNEWS_API_KEY)
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
      
      // STRICT filter - Only real tech news
      const relevantArticles = allArticles.filter(article => {
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        const text = title + ' ' + desc;
        const source = (article.source?.name || '').toLowerCase();
        
        // EXCLUDE - Sadece çok açık alakasız konular
        const excludeKeywords = [
          // Suç & Mahkeme
          'crime', 'police', 'mahkeme', 'suç', 'cinayet', 'öldür', 'court', 'trial', 'arrest', 'prison', 'hapis',
          // Politika
          'election', 'trump', 'biden', 'war',
          // Sağlık
          'covid', 'vaccine', 'hastane',
          // Diğer
          'phone case', 'recipe', 'restaurant', 'yemek'
        ];
        if (excludeKeywords.some(kw => text.includes(kw))) return false;
        
        // EXCLUDE news sources (haber siteleri değil tech siteleri)
        const excludeSources = ['hürriyet', 'sabah', 'sözcü', 'milliyet', 'cnn türk', 'ntv', 'habertürk', 'mynet', 'ensonhaber'];
        if (excludeSources.some(src => source.includes(src))) return false;
        
        // MUST INCLUDE - Tech keywords (daha geniş)
        const mustIncludeKeywords = [
          // Genel Tech
          'tech', 'technology', 'software', 'hardware', 'digital', 'innovation', 'startup',
          // Yazılım & Programlama
          'programming', 'developer', 'code', 'coding', 'framework', 'library', 'api', 'github', 'open source',
          'python', 'javascript', 'react', 'vue', 'node', 'typescript', 'rust', 'java', 'app',
          // Yapay Zeka
          'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'chatgpt', 'gpt', 'llm', 'openai', 'claude',
          'neural network', 'computer vision', 'generative',
          // Oyun
          'gaming', 'game', 'playstation', 'xbox', 'nintendo', 'steam', 'epic games', 'unity', 'unreal', 'esports',
          // Donanım
          'processor', 'cpu', 'gpu', 'nvidia', 'amd', 'intel', 'graphics', 'ram', 'ssd', 'chip',
          // Mobil
          'mobile', 'ios', 'android', 'iphone', 'samsung', 'smartphone', 'tablet', 'app store',
          // Şirketler
          'google', 'apple', 'microsoft', 'meta', 'amazon', 'tesla', 'spacex', 'netflix',
          // Cloud & Platform
          'cloud', 'aws', 'azure', 'platform', 'saas', 'data', 'database',
          // Blockchain & Crypto
          'blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3',
          // Emerging
          'vr', 'ar', 'metaverse', 'virtual reality', 'quantum',
          // Türkçe
          'yazılım', 'teknoloji', 'uygulama', 'oyun', 'donanım'
        ];
        
        // At least 1 tech keyword
        const hasKeyword = mustIncludeKeywords.some(kw => text.includes(kw));
        
        // OR check if it's from a trusted tech source
        const trustedSources = ['techcrunch', 'wired', 'theverge', 'engadget', 'arstechnica', 'venturebeat', 'techmeme', 'hackernews'];
        const isTrustedSource = trustedSources.some(src => source.includes(src));
        
        return hasKeyword || isTrustedSource;
      });
      
      // Remove duplicates and prioritize Turkish + quality sources
      const uniqueArticles = relevantArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      ).sort((a, b) => {
        // Prioritize Turkish articles
        const aTurkish = (a.title || '').match(/[çğıöşüÇĞİÖŞÜ]/) ? 2 : 0;
        const bTurkish = (b.title || '').match(/[çğıöşüÇĞİÖŞÜ]/) ? 2 : 0;
        
        // Prioritize major tech sources
        const qualitySources = ['techcrunch', 'wired', 'theverge', 'engadget', 'arstechnica', 'reuters', 'bloomberg', 'cnn', 'bbc', 'forbes', 'wsj', 'nytimes', 'guardian', 'shiftdelete', 'webtekno', 'donanimhaber'];
        const aQuality = qualitySources.some(source => a.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
        const bQuality = qualitySources.some(source => b.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
        
        return (bTurkish + bQuality) - (aTurkish + aQuality);
      }).slice(0, 60);
      
      const articles = uniqueArticles.map((a) => ({
        title: a?.title,
        description: a?.description,
        content: a?.description || 'Bu haber hakkında daha detaylı bilgi için kaynak linkini ziyaret edebilirsiniz.',
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
          content: 'Yapay zeka teknolojilerinin yazılım geliştirme süreçlerine entegrasyonu, geliştiricilerin iş yükünü önemli ölçüde azaltıyor. GitHub Copilot, ChatGPT ve benzeri araçlar, kod yazma sürecini hızlandırırken aynı zamanda daha kaliteli ve hatasız kod üretimini sağlıyor. Bu gelişme, yazılım sektöründe yeni bir dönemin başlangıcı olarak değerlendiriliyor.',
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
    
    // Fetch multiple queries to get more articles
    const queries = [
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=20`,
      `https://newsapi.org/v2/everything?q=artificial intelligence OR AI&language=en&sortBy=publishedAt&pageSize=20`,
      `https://newsapi.org/v2/everything?q=software OR programming&language=en&sortBy=publishedAt&pageSize=20`,
    ];
    
    let allArticles = [];
    for (const url of queries) {
      try {
        const res = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY } });
        const data = await res.json();
        if (data?.articles) {
          allArticles = allArticles.concat(data.articles);
        }
      } catch (e) {
        // Continue with next query
      }
    }
    
    // Remove duplicates
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    ).slice(0, 60);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, articles: uniqueArticles }),
    };
  } catch (e) {
    // Fallback to dummy data if API fails
    const fallbackArticles = [
      {
        title: "Teknoloji Dünyasında Son Gelişmeler",
        description: "Yapay zeka ve yazılım geliştirme alanında önemli gelişmeler yaşanıyor.",
        url: "https://example.com",
        urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        publishedAt: new Date().toISOString(),
        source: { name: "SoftNews" },
        category: "Teknoloji"
      },
      {
        title: "Yazılım Geliştirmede Yeni Trendler",
        description: "Modern yazılım geliştirme teknikleri ve araçları hakkında güncel bilgiler.",
        url: "https://example.com",
        urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        publishedAt: new Date().toISOString(),
        source: { name: "SoftNews" },
        category: "Yazılım"
      },
      {
        title: "Yapay Zeka ve Gelecek",
        description: "Yapay zeka teknolojilerinin gelecekteki etkileri ve potansiyeli.",
        url: "https://example.com",
        urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        publishedAt: new Date().toISOString(),
        source: { name: "SoftNews" },
        category: "Yapay Zeka"
      }
    ];
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        ok: true, 
        articles: fallbackArticles,
        fallback: true,
        error: e?.message || 'API quota exceeded, showing fallback data'
      }) 
    };
  }
};


