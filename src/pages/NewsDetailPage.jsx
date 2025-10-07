import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NewsCard from '../components/NewsCard';

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
  const news = article || allNews.find(n => n.id === id);
  const related = allNews.filter(n => n.category === news?.category && n.id !== id).slice(0,2);

  if (!news) return <div className="text-center py-20 text-xl">Haber bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">&larr; Geri</button>
        <img src={news.image || news.urlToImage} alt={news.title} className="w-full h-64 object-cover rounded-xl mb-6" />
        <div className="mb-2 text-xs text-blue-700 font-semibold uppercase">{news.category} • {news.date}</div>
        <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
        <p className="text-gray-700 mb-6">{news.content || news.description}</p>
        <h2 className="text-lg font-bold mb-2 text-purple-700">İlgili Haberler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {related.map(r => <NewsCard key={r.id} {...r} />)}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage; 