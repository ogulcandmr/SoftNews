import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import YoutubeSection from '../components/YoutubeSection';
import { Link } from 'react-router-dom';
import NewsPage from './NewsPage';
import { newsItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';
import WeeklySummary from '../components/WeeklySummary';

const HomePage = () => {
  const [items, setItems] = useState(newsItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log('HomePage: Fetching news...');
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      console.log('HomePage: News response:', res);
      if (res.ok && res.articles && res.articles.length > 0) {
        console.log('HomePage: Setting articles:', res.articles.length);
        setItems(res.articles);
      } else {
        console.log('HomePage: No articles, keeping dummy data');
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
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Son Haberler</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.slice(0, 4).map((item, i) => (
                  <Link key={i} to={`/news/${item.id}`} state={{ article: item }}>
                    <NewsCard {...item} />
                  </Link>
                ))}
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