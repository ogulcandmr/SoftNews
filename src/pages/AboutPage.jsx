import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground';

const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative">
    <AnimatedBackground variant="mesh" />
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center">SoftNews Hakkında</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Yazılım ve teknoloji dünyasındaki en güncel haberleri, videoları ve topluluk tartışmalarını 
          yapay zeka destekli özelliklerle bir araya getiren modern bir platform.
        </p>
      </div>

      {/* Özellikler */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span>✨</span> Platform Özellikleri
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📰 Gerçek Zamanlı Haberler</h3>
            <p className="text-gray-600">GNews API entegrasyonu ile güncel teknoloji haberleri. 24 saatlik cache sistemi ile hızlı erişim ve API kredi tasarrufu.</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI Destekli Özetler</h3>
            <p className="text-gray-600">Groq/OpenAI entegrasyonu ile haber özetleri, haftalık raporlar ve akıllı chat asistanı.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎥 YouTube Video Entegrasyonu</h3>
            <p className="text-gray-600">YouTube Data API v3 ile teknoloji videolarını kategorize ederek sunar. Gerçek görüntülenme sayıları ve süre bilgileri.</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">💬 Topluluk Forumu</h3>
            <p className="text-gray-600">Kullanıcıların soru sorup tartışabildiği, AI destekli otomatik yanıt önerileri sunan forum sistemi.</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">👤 Kullanıcı Yönetimi</h3>
            <p className="text-gray-600">JWT tabanlı kimlik doğrulama, profil yönetimi, favori haberler ve kişiselleştirme.</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Akıllı Kategorileme</h3>
            <p className="text-gray-600">Yapay Zeka, Yazılım, Donanım, Oyun, Startup, Mobil kategorilerinde otomatik sınıflandırma.</p>
          </div>
        </div>
      </div>

      {/* Teknik Altyapı */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span>⚙️</span> Teknik Altyapı
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Frontend</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>React 18</strong> - Modern UI kütüphanesi</li>
              <li><strong>React Router v6</strong> - Client-side routing</li>
              <li><strong>TailwindCSS</strong> - Utility-first CSS framework</li>
              <li><strong>Vite</strong> - Hızlı build tool ve dev server</li>
              <li><strong>LocalStorage</strong> - Client-side cache ve state management</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Backend & Serverless</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Netlify Functions</strong> - Serverless API endpoints</li>
              <li><strong>Node.js</strong> - Runtime environment</li>
              <li><strong>JWT</strong> - Güvenli token-based authentication</li>
              <li><strong>bcrypt</strong> - Password hashing</li>
              <li><strong>Rate Limiting</strong> - API abuse koruması</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Veritabanı</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>MongoDB Atlas</strong> - Cloud NoSQL database</li>
              <li><strong>Collections:</strong> users, forum_topics, forum_replies</li>
              <li><strong>Indexing:</strong> Email, username, timestamps</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Dış API'ler</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>GNews API</strong> - Gerçek zamanlı haber akışı</li>
              <li><strong>YouTube Data API v3</strong> - Video içerik ve istatistikler</li>
              <li><strong>Groq API</strong> - LLM inference (llama-3.1-8b-instant)</li>
              <li><strong>OpenAI API</strong> - Alternatif AI provider desteği</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Öne Çıkan Teknik Özellikler */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span>🚀</span> Öne Çıkan Teknik Özellikler
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-semibold text-gray-800">24 Saatlik Akıllı Cache</h4>
              <p className="text-gray-600">Haberler ve AI yanıtları LocalStorage'da cache'lenir, API maliyetlerini %95 azaltır.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="font-semibold text-gray-800">Güvenlik Katmanları</h4>
              <p className="text-gray-600">CORS, rate limiting, input sanitization, JWT token validation, bcrypt password hashing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h4 className="font-semibold text-gray-800">Responsive Design</h4>
              <p className="text-gray-600">Mobile-first yaklaşım, tüm cihazlarda mükemmel görünüm, TailwindCSS breakpoints.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h4 className="font-semibold text-gray-800">Real-time Updates</h4>
              <p className="text-gray-600">Otomatik haber yenileme, canlı forum güncellemeleri, instant search.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h4 className="font-semibold text-gray-800">AI Guardrails</h4>
              <p className="text-gray-600">İçerik güvenliği filtreleri, zararlı prompt engelleme, safe content policy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment & DevOps */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span>☁️</span> Deployment & DevOps
        </h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li><strong>Netlify</strong> - Continuous deployment, serverless functions hosting</li>
          <li><strong>Git-based workflow</strong> - Automatic builds on push</li>
          <li><strong>Environment variables</strong> - Secure API key management</li>
          <li><strong>CDN</strong> - Global edge network for fast content delivery</li>
          <li><strong>HTTPS</strong> - SSL/TLS encryption by default</li>
        </ul>
      </div>

      {/* Performans Optimizasyonları */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span>⚡</span> Performans Optimizasyonları
        </h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Lazy loading ve code splitting (React.lazy)</li>
          <li>Image optimization (Unsplash CDN)</li>
          <li>Debounced search inputs (300ms delay)</li>
          <li>Pagination ve infinite scroll</li>
          <li>Memoization (useMemo, useCallback)</li>
          <li>LocalStorage cache ile API call azaltma</li>
        </ul>
      </div>

      {/* İletişim */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">📬 İletişim</h2>
        <p className="mb-2">E-posta: <a href="mailto:iletisim@softnews.com" className="underline">iletisim@softnews.com</a></p>
        <p className="mb-2">Instagram: <a href="https://instagram.com/softnews" target="_blank" rel="noopener noreferrer" className="underline">@softnews</a></p>
        <p className="text-sm mt-4 opacity-90">
          Bu proje, modern web teknolojileri ve yapay zeka entegrasyonlarını göstermek amacıyla geliştirilmiştir.
        </p>
      </div>
    </div>
  </div>
);

export default AboutPage; 