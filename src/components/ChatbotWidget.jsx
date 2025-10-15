import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatWithNewsContext, getAIConfigPublic } from '../services/aiClient';
import { getNewsContextText, buildNewsContextFromItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';
import { useTheme } from '../contexts/ThemeContext';

const STORAGE_KEY = 'softnews_chat_history_v1';

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

const ChatbotWidget = () => {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(loadHistory());
  const endRef = useRef(null);
  const [aiConfig, setAiConfig] = useState({ provider: '', model: '' });

  const [newsContext, setNewsContext] = useState(getNewsContextText(12));

  useEffect(() => {
    let mounted = true;
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      if (res.ok && res.articles && res.articles.length > 0) {
        setNewsContext(buildNewsContextFromItems(res.articles, 12));
      }
    });
    return () => { mounted = false; };
  }, []);

  // Load AI config (provider/model)
  useEffect(() => {
    try {
      const cfg = getAIConfigPublic();
      setAiConfig(cfg);
    } catch (_) {}
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, history]);

  // Cmd+K toggle
  useEffect(() => {
    const onKey = (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };

    setHistory((h) => [...h, userMsg]);
    setInput('');
    setLoading(true);
    setError('');
    const res = await chatWithNewsContext({
      newsContextText: newsContext,
      history,
      userInput: userMsg.content,
    });
    setLoading(false);
    if (!res.ok) {
      setError('Cevap alınamadı. Lütfen tekrar deneyin.');
      return;
    }
    setHistory((h) => [...h, { role: 'assistant', content: res.content }]);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-5 w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center z-[9999] ${
          isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-purple-700 hover:bg-purple-800'
        }`}
        style={{ bottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        title="SoftNews Asistan"
        data-chatbot-trigger
      >
        <span className="text-xl">💬</span>
      </button>

      {open && (
        <div
          className={`fixed right-5 w-80 max-w-[90vw] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-purple-100'
          }`}
          style={{ bottom: 'calc(100px + env(safe-area-inset-bottom))' }}
        >
          <div className={`px-4 py-3 text-white flex items-center justify-between ${
            isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-700 to-blue-600'
          }`}>
            <div className="font-semibold">SoftNews Asistan</div>
            <div className="flex items-center gap-2 text-[10px] opacity-80">
              <span>{aiConfig.provider || 'ai'}</span>
              <span>•</span>
              <span>{aiConfig.model || 'model'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistory([])}
                className="text-white/80 hover:text-white text-xs underline"
                title="Sohbet geçmişini temizle"
              >Temizle</button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
          </div>
          <div className={`p-3 h-80 overflow-y-auto space-y-2 ${
            isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
          }`}>
            <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Haberlerle ilgili sorular sorabilirsiniz.</div>
            {history.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] p-2 rounded-lg text-sm ${
                  m.role === 'user'
                    ? isDark ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-purple-700 text-white self-end ml-auto'
                    : isDark ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-purple-100 text-gray-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500">Asistan yazıyor…</div>
            )}
            {error && <div className="text-xs text-red-600">{error}</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t bg-white flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Sorunuzu yazın…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-white text-sm disabled:opacity-60 ${
                isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-700 hover:bg-purple-800'
              }`}
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;


