import React, { useState } from 'react';
import NewsCard from '../components/NewsCard';
import { Link } from 'react-router-dom';

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
  'Yapay Zeka',
  'Donanım',
  'Oyun',
  'Yazılım',
  'Startup',
  'Mobil',
];

const NewsPage = () => {
  const [selected, setSelected] = useState('Tümü');
  const filtered = selected === 'Tümü' ? allNews : allNews.filter(n => n.category === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center drop-shadow">Haberler</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, i) => (
            <Link key={i} to={`/news/${item.id}`} className="block">
              <NewsCard {...item} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage; 