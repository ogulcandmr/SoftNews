import React, { useState, useEffect } from 'react';
import { generateWeeklySummary } from '../services/aiClient';

function formatViews(n) {
  if (!n && n !== 0) return '';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'B';
  return String(num);
}

function iso8601ToMinSec(iso) {
  if (!iso) return '';
  // Basic PT#M#S or PT#H#M#S
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const sec = parseInt(m[3] || '0', 10);
  const total = h * 3600 + min * 60 + sec;
  const mm = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState('');

  const categories = ['Tümü', 'Yapay Zeka', 'Startup', 'Mobil', 'Oyun', 'Yazılım', 'Donanım', 'Teknoloji'];

  useEffect(() => {
    let mounted = true;
    setLoadingVideos(true);
    setError('');
    fetch('/api/youtube?q=teknoloji haberleri')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const items = (data?.items || []).map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          url: v.embedUrl || `https://www.youtube.com/embed/${v.id}`,
          category: v.category || 'Teknoloji',
          duration: v.duration || iso8601ToMinSec(v.durationISO8601),
          views: formatViews(v.views),
          aiRecommended: !!v.aiRecommended,
        }));
        setVideos(items);
      })
      .catch((e) => {
        console.error('youtube fetch error', e);
        if (!mounted) return;
        setError('Videolar getirilemedi. Daha sonra tekrar deneyin.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingVideos(false);
      });
    return () => { mounted = false; };
  }, []);

  const filteredVideos = selectedCategory === 'Tümü'
    ? videos
    : videos.filter((video) => video.category === selectedCategory);

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const contextText = videos
        .slice(0, 12)
        .map(v => `Başlık: ${v.title}\nAçıklama: ${v.description?.slice(0, 200) || ''}`)
        .join('\n\n');
      const res = await generateWeeklySummary({ contextText });
      if (res.ok) {
        setAiInsights(res.content);
      } else {
        setAiInsights('AI önerileri oluşturulamadı. Lütfen tekrar deneyin.');
      }
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
        <h1 className="text-3xl font-bold text-blue-800 mb-4 text-center drop-shadow">Videolar</h1>
        {error && (
          <div className="mb-6 text-center text-red-600 text-sm">{error}</div>
        )}
        
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
            <div className="prose prose-sm max-w-none">
              {aiInsights.split('\n').filter(Boolean).map((line, idx) => (
                <div key={idx} className="flex gap-2 items-start mb-1">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{line.replace(/^[-•\s]+/, '')}</span>
                </div>
              ))}
            </div>
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

        {loadingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl shadow-xl bg-white overflow-hidden">
                <div className="w-full h-48 md:h-56 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 mb-2 rounded" />
                  <div className="h-3 bg-gray-100 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.length === 0 ? (
            <div className="text-center text-2xl font-semibold text-gray-600">
              Hiçbir video bulunamadı.
            </div>
          ) : (
            filteredVideos.map((video) => (
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
                      AI Önerisi
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
            ))
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;