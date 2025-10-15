import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import YoutubeSection from '../components/YoutubeSection';
import { Link } from 'react-router-dom';
import NewsPage from './NewsPage';
import { newsItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';
import WeeklySummary from '../components/WeeklySummary';
import AnimatedBackground from '../components/AnimatedBackground';

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
      <AnimatedBackground variant="mesh" />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* HERO - Compact with Dark Mode */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 mb-8">
          <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.25), transparent 35%)" }} />
          <div className="relative p-6 md:p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-4">
              SoftNews
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-3xl mx-auto mb-6">
              Yazılım, donanım ve yapay zekâ dünyasından en güncel haberler, videolar ve topluluk tartışmaları.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/news" className="px-5 py-2.5 rounded-full bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 font-semibold shadow hover:shadow-lg transition-all">Son Haberler</Link>
              <Link to="/forum" className="px-5 py-2.5 rounded-full bg-white/10 dark:bg-white/5 text-white font-semibold border border-white/30 dark:border-white/20 hover:bg-white/15 dark:hover:bg-white/10 transition-all">Topluluğa Katıl</Link>
              <button
                onClick={() => {
                  const summaryElement = document.getElementById('weekly-summary-content');
                  if (summaryElement) {
                    summaryElement.style.display = summaryElement.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-purple-600 dark:bg-purple-700 text-white font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-all"
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
                  {items.length} haber yüklendi
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
                  .slice(0, 12) // 12 en iyi haber
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
            <div className="rounded-2xl shadow-xl bg-gradient-to-br from-red-50 to-pink-50 p-6 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">Öne Çıkan Videolar</h2>
              </div>
              <div className="w-full">
                <YoutubeSection />
              </div>
              <div className="mt-4 text-center">
                <Link to="/videos" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
                  Tüm Videoları İzle
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold mb-4 text-purple-900 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Hızlı Erişim
              </h2>
              <div className="space-y-3">
                <Link to="/forum" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Forum</div>
                      <div className="text-xs text-gray-500">Topluluğa katıl</div>
                    </div>
                  </div>
                </Link>
                <Link to="/profile" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Profilim</div>
                      <div className="text-xs text-gray-500">Ayarlar ve tercihler</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 