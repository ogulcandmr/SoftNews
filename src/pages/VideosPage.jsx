import React, { useState, useEffect } from 'react';
import { generateWeeklySummary } from '../services/aiClient';

const videos = [
  {
    id: 1,
    title: 'Yapay Zeka ile Kodlama Devrimi',
    url: 'https://www.youtube.com/embed/MB26JRTbdKE',
    category: 'Yapay Zeka',
    duration: '15:30',
    views: '2.5M',
    description: 'Yapay zeka teknolojilerinin yazılım geliştirme süreçlerine etkisi',
    aiRecommended: true,
  },
  {
    id: 2,
    title: 'Teknoloji Girişimleri ve Startup Dünyası',
    url: 'https://www.youtube.com/embed/hc-yBuo057E',
    category: 'Startup',
    duration: '22:15',
    views: '1.8M',
    description: 'Başarılı teknoloji girişimlerinin hikayeleri ve ipuçları',
    aiRecommended: false,
  },
  {
    id: 3,
    title: 'Mobil Uygulama Geliştirme Rehberi',
    url: 'https://www.youtube.com/embed/2Ji-clqUYnA',
    category: 'Mobil',
    duration: '18:45',
    views: '3.2M',
    description: 'React Native ile mobil uygulama geliştirme süreci',
    aiRecommended: true,
  },
  {
    id: 4,
    title: 'Oyun Programlama Temelleri',
    url: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
    category: 'Oyun',
    duration: '25:10',
    views: '4.1M',
    description: 'Unity ile oyun geliştirme başlangıç rehberi',
    aiRecommended: false,
  },
  {
    id: 5,
    title: 'Web Geliştirme 2024 Trendleri',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Yazılım',
    duration: '20:30',
    views: '1.5M',
    description: 'Modern web geliştirme teknolojileri ve trendleri',
    aiRecommended: true,
  },
  {
    id: 6,
    title: 'Donanım ve IoT Projeleri',
    url: 'https://www.youtube.com/embed/example6',
    category: 'Donanım',
    duration: '16:20',
    views: '890K',
    description: 'Arduino ve Raspberry Pi ile IoT projeleri',
    aiRecommended: false,
  },
];

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const categories = ['Tümü', 'Yapay Zeka', 'Startup', 'Mobil', 'Oyun', 'Yazılım', 'Donanım'];
  
  const filteredVideos = selectedCategory === 'Tümü' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const insights = await generateWeeklySummary();
      setAiInsights(insights);
    } catch (error) {
      console.error('AI insights error:', error);
      setAiInsights('AI önerileri oluşturulamadı. Lütfen tekrar deneyin.');
    }
    setLoadingInsights(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center drop-shadow">Videolar</h1>
        
        {/* AI Önerileri */}
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-purple-800">🤖 AI Video Önerileri</h2>
            <button
              onClick={generateAIInsights}
              disabled={loadingInsights}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingInsights ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Oluşturuluyor...
                </>
              ) : (
                'AI Önerileri Al'
              )}
            </button>
          </div>
          {aiInsights && (
            <p className="text-gray-700 leading-relaxed">{aiInsights}</p>
          )}
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border font-semibold transition-all duration-200 shadow-sm ${
                selectedCategory === category 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-white text-purple-700 hover:bg-purple-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="rounded-2xl shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="relative">
                <iframe
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  className="w-full h-48 md:h-56"
                ></iframe>
                {video.aiRecommended && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    🤖 AI Önerisi
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {video.category}
                  </span>
                  <span className="text-xs text-gray-500">{video.views} görüntüleme</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h2>
                <p className="text-sm text-gray-600">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosPage; 