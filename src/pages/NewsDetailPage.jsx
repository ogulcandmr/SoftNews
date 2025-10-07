import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { fetchLatestNews } from '../services/newsService';

const allNews = [
  {
    id: '1',
    title: 'Yapay Zeka ile Kodlama Devrimi',
    description: 'Yapay zeka destekli araçlar yazılım geliştirmede devrim yaratıyor. Geliştiriciler artık daha hızlı ve verimli kod yazabiliyor.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Yapay Zeka',
    date: '2024-07-10',
    content: 'Yapay zeka ile kodlama artık çok daha hızlı ve verimli. Geliştiriciler, AI destekli araçlarla projelerini kısa sürede tamamlayabiliyor...'
  },
  {
    id: '2',
    title: 'Yeni Nesil Mobil İşlemciler',
    description: 'Mobil cihazlarda performans ve enerji verimliliği yeni nesil işlemcilerle zirveye çıkıyor.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    category: 'Donanım',
    date: '2024-07-09',
    content: 'Yeni nesil mobil işlemciler, pil ömrünü uzatırken performanstan ödün vermiyor...'
  },
  // ... diğer haberler ...
];

const NewsDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const article = location.state?.article;
  const navigate = useNavigate();
  const [allArticles, setAllArticles] = useState(allNews);
  const [loading, setLoading] = useState(false);
  
  const news = article || allArticles.find(n => n.id === id);
  const related = allArticles.filter(n => n.category === news?.category && n.id !== id).slice(0, 4);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      if (res.ok && res.articles && res.articles.length > 0) {
        setAllArticles(res.articles);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Haber Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Bu haber mevcut değil veya kaldırılmış olabilir.</p>
          <button 
            onClick={() => navigate('/news')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Haberlere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Article */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="m-6 text-blue-600 hover:text-blue-800 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
          
          <div className="px-6 pb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {news.category}
              </span>
              <span className="ml-3 text-gray-500 text-sm">{news.date}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{news.title}</h1>
            
            <img 
              src={news.image || news.urlToImage} 
              alt={news.title} 
              className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg" 
            />
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {news.content || news.description}
              </p>
              
              {news.url && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Kaynak:</p>
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {news.url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            İlgili Haberler
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : related.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(r => (
                <div key={r.id} className="group cursor-pointer" onClick={() => navigate(`/news/${r.id}`, { state: { article: r } })}>
                  <NewsCard {...r} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>İlgili haber bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage; 