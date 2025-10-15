import React, { useEffect, useMemo, useState } from 'react';
import { generateWeeklySummary } from '../services/aiClient';
import { getNewsContextText, buildNewsContextFromItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';

const CACHE_KEY = 'softnews_weekly_summary_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.content || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.content;
  } catch {
    return null;
  }
}

function saveCache(content) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ content, timestamp: Date.now() })
    );
  } catch {
    // ignore quota errors
  }
}

const WeeklySummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(loadCache());

  const [contextText, setContextText] = useState(getNewsContextText(12));

  useEffect(() => {
    let mounted = true;
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      if (res.ok && res.articles && res.articles.length > 0) {
        setContextText(buildNewsContextFromItems(res.articles, 12));
      }
    });
    return () => { mounted = false; };
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    const res = await generateWeeklySummary({ contextText });
    setLoading(false);
    if (!res.ok) {
      setError('Özet alınamadı. Lütfen daha sonra tekrar deneyin.');
      return;
    }
    setContent(res.content);
    saveCache(res.content);
  };

  // Remove auto-fetch - only load from cache on mount
  useEffect(() => {
    // Only load from cache, don't auto-fetch
  }, []);

  return (
    <div className="rounded-3xl shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm border border-purple-100/50 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Bu Haftalık Özet</h2>
              <p className="text-purple-100 text-sm">AI destekli teknoloji analizi</p>
            </div>
          </div>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white text-purple-600 font-semibold hover:bg-purple-50 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
            title="AI ile özet oluştur"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Özet Oluştur
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">Hata Oluştu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!content && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">Henüz özet oluşturulmadı</p>
            <p className="text-gray-500 text-sm">Yukarıdaki butona tıklayarak AI özeti oluşturabilirsiniz</p>
          </div>
        )}

        {content && (
          <div className="space-y-4">
            {content
              .split('\n')
              .filter(Boolean)
              .map((line, idx) => (
                <div 
                  key={idx} 
                  className="group flex gap-4 items-start p-4 rounded-xl bg-white/80 hover:bg-white border border-gray-100 hover:border-purple-200 transition-all hover:shadow-md"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-grow pt-1">
                    {line.replace(/^[-•\s]+/, '')}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>AI tarafından oluşturuldu</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(CACHE_KEY);
              setContent(null);
            }}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
            title="Önbelleği temizle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Temizle
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;


