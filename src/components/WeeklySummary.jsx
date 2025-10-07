import React, { useEffect, useMemo, useState } from 'react';
import { generateWeeklySummary } from '../services/aiClient';
import { getNewsContextText } from '../data/newsData';

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

  const contextText = useMemo(() => getNewsContextText(12), []);

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

  useEffect(() => {
    if (!content) {
      // Initial fetch on mount if no valid cache
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl shadow-xl bg-white/90 p-6 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-purple-700">Bu Haftalık Özet</h2>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="text-sm px-3 py-1 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-60"
          title="Özeti yenile"
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}
      {!content && !loading && !error && (
        <div className="text-gray-500 text-sm">Özet hazır değil.</div>
      )}
      {content && (
        <div className="prose prose-sm max-w-none">
          {content
            .split('\n')
            .filter(Boolean)
            .map((line, idx) => (
              <div key={idx} className="flex gap-2 items-start mb-1">
                <span className="text-purple-600 mt-1">•</span>
                <span>{line.replace(/^[-•\s]+/, '')}</span>
              </div>
            ))}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-400">AI tarafından oluşturuldu</div>
    </div>
  );
};

export default WeeklySummary;


