import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { fetchLatestNews } from '../services/newsService';
import AnimatedBackground from '../components/AnimatedBackground';

const allNews = [
  {
    id: 1,
    title: 'Yapay Zeka ile Kodlama Devrimi',
    description: 'Yapay zeka destekli araçlar yazılım geliştirmede devrim yaratıyor. Geliştiriciler artık daha hızlı ve verimli kod yazabiliyor.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Yapay Zeka',
    date: '2024-07-10',
  },
  {
    id: 2,
    title: 'Yeni Nesil Mobil İşlemciler',
    description: 'Mobil cihazlarda performans ve enerji verimliliği yeni nesil işlemcilerle zirveye çıkıyor.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    category: 'Donanım',
    date: '2024-07-09',
  },
  {
    id: 3,
    title: 'Oyun Dünyasında Büyük Yenilik',
    description: 'Oyun motorları ve grafik teknolojilerindeki gelişmeler, oyun deneyimini bambaşka bir seviyeye taşıyor.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Oyun',
    date: '2024-07-08',
  },
  {
    id: 4,
    title: 'Yazılımda Uzaktan Çalışma Trendleri',
    description: 'Uzaktan çalışma kültürü yazılım sektöründe kalıcı hale geliyor. Şirketler hibrit ve remote modelleri benimsiyor.',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80',
    category: 'Yazılım',
    date: '2024-07-07',
  },
  {
    id: 5,
    title: 'Startuplarda Yatırım Rüzgarı',
    description: "Teknoloji girişimleri 2024'te rekor yatırım aldı. Yeni unicorn'lar yolda.",
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    category: 'Startup',
    date: '2024-07-06',
  },
  {
    id: 6,
    title: 'Mobil Uygulama Güvenliği',
    description: 'Mobil uygulamalarda güvenlik açıkları ve alınması gereken önlemler.',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80',
    category: 'Mobil',
    date: '2024-07-05',
  },
];

const categories = [
  'Tümü',
  'Teknoloji',
  'Yapay Zeka',
  'Donanım',
  'Oyun',
  'Yazılım',
  'Startup',
  'Mobil',
];

const NewsPage = () => {
  const [selected, setSelected] = useState('Tümü');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log('NewsPage: Starting to fetch news...');
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      console.log('NewsPage: News response:', res);
      if (res.ok && res.articles && res.articles.length > 0) {
        console.log('NewsPage: Setting articles:', res.articles.length);
        setItems(res.articles);
      } else {
        console.error('NewsPage: No articles from API');
        // NO fallback - keep empty
        setItems([]);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = selected === 'Tümü' ? items : items.filter(n => n.category === selected);

  // Cache is now permanent for 24 hours - no manual refresh needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <AnimatedBackground variant="mesh" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 drop-shadow">Haberler</h1>
          <p className="text-gray-600 mt-2">Güncel teknoloji haberleri - Haftada bir güncellenir</p>
          {!loading && items.length > 0 && (
            <div className="text-sm text-green-600 mb-4 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {items.length} haber yüklendi
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-4 py-2 rounded-full border font-semibold transition-all duration-200 shadow-sm ${selected === cat ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filtered
              .sort((a, b) => {
                // Prioritize quality sources
                const qualitySources = ['techcrunch', 'wired', 'theverge', 'engadget', 'arstechnica', 'reuters', 'bloomberg', 'cnn', 'bbc', 'forbes'];
                const aQuality = qualitySources.some(source => a.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
                const bQuality = qualitySources.some(source => b.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
                return bQuality - aQuality;
              })
              .slice(0, selected === 'Tümü' ? 50 : 20) // 20 per category, 50 total
              .map((item, i) => (
                <Link
                  key={i}
                  to={`/news/${item.id}`}
                  state={{ article: item }}
                  className="block"
                >
                  <NewsCard {...item} />
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Haberler Yükleniyor</h3>
              <p className="text-gray-500">En güncel teknoloji haberlerini getiriyoruz...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 