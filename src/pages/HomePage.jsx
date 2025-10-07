import React from 'react';
import NewsCard from '../components/NewsCard';
import YoutubeSection from '../components/YoutubeSection';
import { Link } from 'react-router-dom';
import NewsPage from './NewsPage';
import { newsItems } from '../data/newsData';
import WeeklySummary from '../components/WeeklySummary';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 mb-10">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.25), transparent 35%)" }} />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow">
                SoftNews
              </h1>
              <p className="mt-3 md:mt-4 text-white/90 text-base md:text-lg max-w-2xl">
                Yazılım, donanım ve yapay zekâ dünyasından en güncel haberler, videolar ve topluluk tartışmaları. AI destekli haftalık özet ve akıllı sohbet ile daha hızlı takip edin.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/news" className="px-5 py-2.5 rounded-full bg-white text-purple-700 font-semibold shadow hover:shadow-lg">Son Haberler</Link>
                <Link to="/forum" className="px-5 py-2.5 rounded-full bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/15">Topluluğa Katıl</Link>
              </div>
            </div>
            <div className="w-full md:w-[420px]">
              <div className="relative">
                <WeeklySummary />
                <Link
                  to="/summary"
                  className="absolute -bottom-3 right-3 text-xs px-3 py-1.5 rounded-full bg-white/90 border border-purple-200 text-purple-700 shadow"
                >
                  Ayrıntılı gör
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 responsive-grid">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {newsItems.map((item, i) => (
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