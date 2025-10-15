import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    articlesRead: 0,
    videosWatched: 0,
    forumPosts: 0,
    aiInteractions: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/LoginPage');
      return;
    }
    // Load stats from localStorage
    const savedStats = localStorage.getItem('softnews_user_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user, navigate]);

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
    { id: 'stats', label: 'İstatistikler', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{user.name || 'Kullanıcı'}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-1">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Üyelik: {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-6 transition-colors duration-300">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Profil Bilgileri</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">İsim</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{user.name || 'Belirtilmemiş'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{user.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kullanıcı Adı</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{user.username || 'Belirtilmemiş'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Üyelik Tarihi</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Görünüm Ayarları</h3>
                  
                  {/* Dark Mode Toggle */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-blue-200 dark:border-gray-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                          {isDark ? '🌙' : '☀️'} Karanlık Tema
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {isDark ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                          isDark ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                            isDark ? 'transform translate-x-8' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Bildirimler</h4>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                        <span className="text-gray-700 dark:text-gray-300">Yeni haber bildirimleri</span>
                      </label>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Dil</h4>
                      <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                        <option>Türkçe</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Kullanım İstatistikleri</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                    <div className="text-4xl mb-2">📰</div>
                    <div className="text-3xl font-bold mb-1">{stats.articlesRead}</div>
                    <div className="text-blue-100">Okunan Haber</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <div className="text-4xl mb-2">🎥</div>
                    <div className="text-3xl font-bold mb-1">{stats.videosWatched}</div>
                    <div className="text-purple-100">İzlenen Video</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
                    <div className="text-4xl mb-2">💬</div>
                    <div className="text-3xl font-bold mb-1">{stats.forumPosts}</div>
                    <div className="text-green-100">Forum Gönderisi</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white shadow-lg">
                    <div className="text-4xl mb-2">🤖</div>
                    <div className="text-3xl font-bold mb-1">{stats.aiInteractions}</div>
                    <div className="text-orange-100">AI Etkileşimi</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
