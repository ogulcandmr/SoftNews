import React from 'react';
import NewsCard from '../components/NewsCard';
import YoutubeSection from '../components/YoutubeSection';
import { Link } from 'react-router-dom';
import NewsPage from './NewsPage';

const news = [
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

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">SoftNews: Yazılım ve Teknoloji Dünyası</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 responsive-grid">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {news.map((item, i) => (
                <Link key={i} to={`/news/${item.id}`}>
                  <NewsCard {...item} />
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div className="rounded-2xl shadow-xl bg-white/90 p-8 flex flex-col items-center w-full max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">İlgili Videolar</h2>
              <div className="w-full">
                <YoutubeSection />
              </div>
            </div>
            <div className="rounded-xl shadow-md bg-white/80 p-4">
              <h2 className="text-lg font-bold mb-2 text-purple-700">Öne Çıkan Yazılar</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Yazılımda Kariyer Planlama</li>
                <li>En Yeni Frameworkler</li>
                <li>Teknoloji Girişimleri</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 