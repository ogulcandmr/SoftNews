import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { fetchLatestNews } from '../services/newsService';
import AnimatedBackground from '../components/AnimatedBackground';

// Fallback data removed - using API only

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