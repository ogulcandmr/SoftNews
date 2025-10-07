import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import YoutubeSection from '../components/YoutubeSection';
import { Link } from 'react-router-dom';
import NewsPage from './NewsPage';
import { newsItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';
import WeeklySummary from '../components/WeeklySummary';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log('HomePage: Starting to fetch news...');
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      console.log('HomePage: News response:', res);
      if (res.ok && res.articles && res.articles.length > 0) {
        console.log('HomePage: Setting articles:', res.articles.length);
        setItems(res.articles);
      } else {
        console.log('HomePage: No articles received, using fallback data');
        // Fallback to dummy data if API fails
        setItems([
          {
            id: 1,
            title: "Yapay Zeka Teknolojisinde Yeni Çığır: GPT-5 Duyuruldu",
            description: "OpenAI, yeni nesil yapay zeka modeli GPT-5'i duyurdu. Bu model, önceki versiyonlara göre çok daha gelişmiş dil anlama ve üretme yeteneklerine sahip.",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
            category: "Yapay Zeka",
            date: "2024-01-15",
            url: "#"
          },
          {
            id: 2,
            title: "Apple Vision Pro Türkiye'de Satışa Çıktı",
            description: "Apple'ın yeni sanal gerçeklik gözlüğü Vision Pro, Türkiye'de resmi olarak satışa sunuldu. Teknoloji meraklıları için yeni bir deneyim kapısı açıldı.",
            image: "https://images.unsplash.com/photo-1592478411213-6153e4c4c8f8?auto=format&fit=crop&w=800&q=80",
            category: "Donanım",
            date: "2024-01-14",
            url: "#"
          },
          {
            id: 3,
            title: "Microsoft Copilot Pro Yaygınlaşıyor",
            description: "Microsoft'un AI asistanı Copilot Pro, daha fazla kullanıcıya ulaşmaya başladı. Office uygulamalarında devrim yaratan bu teknoloji, iş dünyasını dönüştürüyor.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            category: "Yazılım",
            date: "2024-01-13",
            url: "#"
          },
          {
            id: 4,
            title: "Tesla Cybertruck Türkiye'ye Geliyor",
            description: "Tesla'nın çığır açan elektrikli kamyonu Cybertruck, Türkiye pazarına giriş yapıyor. Sürdürülebilir ulaşımda yeni bir dönem başlıyor.",
            image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
            category: "Mobilite",
            date: "2024-01-12",
            url: "#"
          },
          {
            id: 5,
            title: "Google Bard'da Yeni Özellikler",
            description: "Google'ın AI chatbot'u Bard, yeni güncellemelerle kullanıcı deneyimini geliştiriyor. Daha akıllı ve yaratıcı yanıtlar sunan sistem, rekabeti artırıyor.",
            image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80",
            category: "Yapay Zeka",
            date: "2024-01-11",
            url: "#"
          },
          {
            id: 6,
            title: "Samsung Galaxy S24 Ultra İncelemesi",
            description: "Samsung'un yeni amiral gemisi telefonu Galaxy S24 Ultra, profesyonel fotoğrafçılık ve AI özellikleriyle dikkat çekiyor. Detaylı incelememizde tüm özelliklerini inceledik.",
            image: "https://images.unsplash.com/photo-1511707171631-9ed0c5a0b4b4?auto=format&fit=crop&w=800&q=80",
            category: "Mobil",
            date: "2024-01-10",
            url: "#"
          }
        ]);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* HERO - Compact */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 mb-8">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.25), transparent 35%)" }} />
          <div className="relative p-6 md:p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-4">
              SoftNews
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-3xl mx-auto mb-6">
              Yazılım, donanım ve yapay zekâ dünyasından en güncel haberler, videolar ve topluluk tartışmaları.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/news" className="px-5 py-2.5 rounded-full bg-white text-purple-700 font-semibold shadow hover:shadow-lg">Son Haberler</Link>
              <Link to="/forum" className="px-5 py-2.5 rounded-full bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/15">Topluluğa Katıl</Link>
              <button
                onClick={() => {
                  const summaryElement = document.getElementById('weekly-summary-content');
                  if (summaryElement) {
                    summaryElement.style.display = summaryElement.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              >
                AI Özeti Göster
              </button>
            </div>
          </div>
        </div>

        {/* WEEKLY SUMMARY - Collapsible */}
        <div className="mb-8">
          <div id="weekly-summary-content" style={{ display: 'none' }}>
            <WeeklySummary />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 responsive-grid">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-800">En İyi Haberler</h2>
              {!loading && items.length > 0 && (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cache'den
                </div>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items
                  .sort((a, b) => {
                    // Prioritize quality sources for homepage
                    const qualitySources = ['techcrunch', 'wired', 'theverge', 'engadget', 'arstechnica', 'reuters', 'bloomberg', 'cnn', 'bbc', 'forbes'];
                    const aQuality = qualitySources.some(source => a.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
                    const bQuality = qualitySources.some(source => b.source?.name?.toLowerCase().includes(source)) ? 1 : 0;
                    return bQuality - aQuality;
                  })
                  .slice(0, 6) // Sadece 6 en iyi haber
                  .map((item, i) => (
                    <Link key={i} to={`/news/${item.id}`} state={{ article: item }}>
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
            <div className="text-center mt-6">
              <Link 
                to="/news" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Tüm Haberleri Gör
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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