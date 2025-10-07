import React, { useEffect, useMemo, useRef, useState } from 'react';
import { chatWithNewsContext } from '../services/aiClient';
import { getNewsContextText, buildNewsContextFromItems } from '../data/newsData';
import { fetchLatestNews } from '../services/newsService';

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
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(loadHistory());
  const endRef = useRef(null);

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

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, history]);

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
        className="fixed right-5 w-12 h-12 rounded-full bg-purple-700 text-white shadow-lg flex items-center justify-center hover:bg-purple-800 z-[9999]"
        style={{ bottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        title="SoftNews Asistan"
      >
        <span className="text-xl">💬</span>
      </button>

      {open && (
        <div
          className="fixed right-5 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden z-[9999]"
          style={{ bottom: 'calc(100px + env(safe-area-inset-bottom))' }}
        >
          <div className="px-4 py-3 bg-gradient-to-r from-purple-700 to-blue-600 text-white flex items-center justify-between">
            <div className="font-semibold">SoftNews Asistan</div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="p-3 h-80 overflow-y-auto space-y-2 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="text-xs text-gray-500 mb-1">Haberlerle ilgili sorular sorabilirsiniz.</div>
            {history.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] p-2 rounded-lg text-sm ${
                  m.role === 'user'
                    ? 'bg-purple-700 text-white self-end ml-auto'
                    : 'bg-white border border-purple-100 text-gray-800'
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
              className="px-3 py-2 rounded-lg bg-purple-700 text-white text-sm hover:bg-purple-800 disabled:opacity-60"
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


