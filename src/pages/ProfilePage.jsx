import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWeeklySummary } from '../services/aiClient';

const dummyFavorites = [
  {
    id: '1',
    title: 'Yapay Zeka ile Kodlama Devrimi',
    date: '2024-07-10',
  },
  {
    id: '2',
    title: 'Yeni Nesil Mobil İşlemciler',
    date: '2024-07-09',
  },
];

const dummyTopics = [
  {
    id: 1,
    title: 'Yazılımda Kariyer Planı Nasıl Yapılır?',
    date: '2024-07-10',
  },
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [aiStats, setAiStats] = useState({
    weeklySummariesGenerated: 0,
    aiChatMessages: 0,
    forumReplies: 0,
    totalAIInteractions: 0
  });
  const [personalizedSummary, setPersonalizedSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('softnews_user');
    if (!stored) {
      navigate('/LoginPage');
    } else {
      setUser(JSON.parse(stored));
      // Load AI stats from localStorage
      const stats = localStorage.getItem('softnews_ai_stats');
      if (stats) {
        setAiStats(JSON.parse(stats));
      }
    }
  }, [navigate]);

  const generatePersonalizedSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await generateWeeklySummary();
      setPersonalizedSummary(summary);
    } catch (error) {
      console.error('Personalized summary error:', error);
      setPersonalizedSummary('Özet oluşturulamadı. Lütfen tekrar deneyin.');
    }
    setLoadingSummary(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Profilim</h1>
        
        {/* AI İstatistikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{aiStats.weeklySummariesGenerated}</div>
            <div className="text-sm opacity-90">Haftalık Özet</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{aiStats.aiChatMessages}</div>
            <div className="text-sm opacity-90">AI Sohbet</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{aiStats.forumReplies}</div>
            <div className="text-sm opacity-90">Forum Yanıtı</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{aiStats.totalAIInteractions}</div>
            <div className="text-sm opacity-90">Toplam AI</div>
          </div>
        </div>

        <div className="mb-6">
          <span className="font-semibold">E-posta:</span> {user.email}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Favori Haberlerim</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {dummyFavorites.map(fav => (
              <li key={fav.id}>{fav.title} <span className="text-xs text-gray-400">({fav.date})</span></li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Açtığım Forum Konuları</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {dummyTopics.map(topic => (
              <li key={topic.id}>{topic.title} <span className="text-xs text-gray-400">({topic.date})</span></li>
            ))}
          </ul>
        </div>

        {/* Kişiselleştirilmiş AI Özeti */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">Kişiselleştirilmiş AI Özeti</h2>
          <button
            onClick={generatePersonalizedSummary}
            disabled={loadingSummary}
            className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingSummary ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Oluşturuluyor...
              </>
            ) : (
              '🤖 AI Özeti Oluştur'
            )}
          </button>
          {personalizedSummary && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-gray-700 leading-relaxed">{personalizedSummary}</p>
            </div>
          )}
        </div>
        <div className="mb-6 flex gap-4 items-center">
          <a href="https://instagram.com/ogulcan_dmr" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.013 7.052.072 5.77.13 4.812.312 4.05.55c-.78.244-1.44.57-2.1 1.23-.66.66-.986 1.32-1.23 2.1C.312 4.812.13 5.77.072 7.052.013 8.332 0 8.736 0 12c0 3.264.013 3.668.072 4.948.058 1.282.24 2.24.478 3.002.244.78.57 1.44 1.23 2.1.66.66 1.32.986 2.1 1.23.762.238 1.72.42 3.002.478C8.332 23.987 8.736 24 12 24s3.668-.013 4.948-.072c1.282-.058 2.24-.24 3.002-.478.78-.244 1.44-.57 2.1-1.23.66-.66.986-1.32 1.23-2.1.238-.762.42-1.72.478-3.002.059-1.28.072-1.684.072-4.948s-.013-3.668-.072-4.948c-.058-1.282-.24-2.24-.478-3.002-.244-.78-.57-1.44-1.23-2.1-.66-.66-1.32-.986-2.1-1.23-.762-.238-1.72-.42-3.002-.478C15.668.013 15.264 0 12 0z"/><path d="M12 5.838A6.162 6.162 0 1 0 12 18.162 6.162 6.162 0 1 0 12 5.838zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
          </a>
          <a href="https://github.com/ogulcandmr" target="_blank" rel="noopener noreferrer" title="Github">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 