import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const forumCategories = [
  'Genel',
  'Yazılım',
  'Donanım',
  'Yapay Zeka',
  'Oyun',
  'Mobil',
];

const dummyTopics = [
  {
    id: 1,
    title: 'Yazılımda Kariyer Planı Nasıl Yapılır?',
    category: 'Yazılım',
    author: 'ogulcan',
    date: '2024-07-10',
    replies: 3,
    lastReply: '2024-07-10',
    hasAI: false,
  },
  {
    id: 2,
    title: 'En iyi oyun motoru hangisi?',
    category: 'Oyun',
    author: 'ayse',
    date: '2024-07-09',
    replies: 5,
    lastReply: '2024-07-09',
    hasAI: false,
  },
  {
    id: 3,
    title: 'Yapay zeka ile ilgili kaynak önerir misiniz?',
    category: 'Yapay Zeka',
    author: 'mehmet',
    date: '2024-07-08',
    replies: 2,
    lastReply: '2024-07-08',
    hasAI: true,
  },
  {
    id: 4,
    title: 'React vs Vue.js - Hangisini Seçmeliyim?',
    category: 'Yazılım',
    author: 'developer123',
    date: '2024-07-07',
    replies: 0,
    lastReply: null,
    hasAI: false,
  },
  {
    id: 5,
    title: 'Yapay Zeka Etik Kuralları Nelerdir?',
    category: 'Yapay Zeka',
    author: 'ai_enthusiast',
    date: '2024-07-06',
    replies: 0,
    lastReply: null,
    hasAI: false,
  },
];

async function apiListTopics() {
  try {
    const res = await fetch('/api/forum/topics');
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error(data?.message || 'List failed');
    return data.data;
  } catch (e) {
    console.warn('Forum list fallback to dummy:', e.message);
    return dummyTopics;
  }
}

async function apiCreateTopic({ title, category, content = '' }) {
  const res = await fetch('/api/forum/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category, content })
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Create failed');
  return data.data;
}

const ForumPage = () => {
  const [selected, setSelected] = useState('Tümü');
  const [topics, setTopics] = useState([]); // start empty to avoid fake flicker
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Genel' });
  const [aiProcessing, setAiProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState({ titles: [], tags: [] });

  const filtered = selected === 'Tümü' ? topics : topics.filter(t => t.category === selected);

  // Sunucudan konuları yükle
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    apiListTopics()
      .then(items => { if (mounted) setTopics(items); })
      .catch(e => { if (mounted) setError('Konular yüklenemedi'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await apiCreateTopic({ title: form.title, category: form.category, content: '' });
      setTopics(prev => [
        {
          id: created.id,
          title: created.title,
          category: created.category,
          author: created.author || 'guest',
          date: (created.created_at || '').slice(0,10),
          replies: created.replies_count ?? 0,
          lastReply: created.last_reply_at ? created.last_reply_at.slice(0,10) : null,
          hasAI: created.has_ai_reply ?? false,
        },
        ...prev,
      ]);
      setForm({ title: '', category: 'Genel' });
      setShowForm(false);
    } catch (err) {
      console.error('Create topic failed:', err);
      // fallback lokal ekle
      setTopics(prev => [
        {
          id: Math.max(0, ...prev.map(t => Number(t.id) || 0)) + 1,
          title: form.title,
          category: form.category,
          author: 'guest',
          date: new Date().toISOString().slice(0, 10),
          replies: 0,
          lastReply: null,
          hasAI: false,
        },
        ...prev,
      ]);
      setForm({ title: '', category: 'Genel' });
      setShowForm(false);
    }
  };

  // Suggest similar titles and tags when typing
  useEffect(() => {
    const t = (form.title || '').toLowerCase();
    if (!t) {
      setSuggestions({ titles: [], tags: [] });
      return;
    }
    const titles = topics
      .filter((x) => x.title?.toLowerCase().includes(t))
      .slice(0, 5)
      .map((x) => x.title);
    const tags = [];
    if (/yapay zeka|ai|makine öğrenimi|ml/.test(t)) tags.push('Yapay Zeka');
    if (/donanım|işlemci|ekran kartı|gpu|cpu|hardware/.test(t)) tags.push('Donanım');
    if (/oyun|gaming|playstation|xbox|steam/.test(t)) tags.push('Oyun');
    if (/yazılım|software|kod|react|vue|angular|node/.test(t)) tags.push('Yazılım');
    if (/startup|girişim|yatırım|finansman/.test(t)) tags.push('Startup');
    if (/mobil|telefon|ios|android/.test(t)) tags.push('Mobil');
    setSuggestions({ titles, tags });
  }, [form.title, topics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2 drop-shadow">Forum</h1>
          {aiProcessing && (
            <div className="text-sm text-purple-600 flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              AI asistanı yanıtlar hazırlıyor...
            </div>
          )}
        </div>
        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-gray-500">Konular yükleniyor…</div>
        )}
        {error && !loading && (
          <div className="bg-white rounded-xl shadow p-6 text-red-600">{error}</div>
        )}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            className={`px-4 py-2 rounded-full border font-semibold transition-all duration-200 shadow-sm ${selected === 'Tümü' ? 'bg-purple-700 text-white' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
            onClick={() => setSelected('Tümü')}
          >
            Tümü
          </button>
          {forumCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-4 py-2 rounded-full border font-semibold transition-all duration-200 shadow-sm ${selected === cat ? 'bg-purple-700 text-white' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-5 py-2 rounded-full bg-purple-700 text-white font-semibold shadow hover:bg-purple-800 transition"
          >
            + Yeni Konu Aç
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Konu başlığı"
              className="border rounded px-3 py-2"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <select
              className="border rounded px-3 py-2"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {forumCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(suggestions.titles.length > 0 || suggestions.tags.length > 0) && (
              <div className="rounded border border-purple-100 bg-purple-50/50 p-3">
                {suggestions.titles.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Benzer başlıklar</div>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {suggestions.titles.map((t, i) => (
                        <li key={i}>
                          <button type="button" className="underline hover:text-purple-700" onClick={() => setForm(f => ({ ...f, title: t }))}>{t}</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-purple-700 font-semibold mb-1">Önerilen etiket/kategori</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.tags.map((tg) => (
                        <button
                          key={tg}
                          type="button"
                          className={`px-2 py-1 rounded-full text-xs border ${form.category===tg? 'bg-purple-600 text-white':'bg-white text-purple-700'}`}
                          onClick={() => setForm(f => ({ ...f, category: tg }))}
                        >
                          {tg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button type="submit" className="self-end px-5 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition">Konu Oluştur</button>
          </form>
        )}
        <div className="bg-white rounded-xl shadow divide-y">
          {!loading && filtered.length === 0 && <div className="p-6 text-center text-gray-500">Hiç konu yok.</div>}
          {filtered.map(topic => (
            <Link key={topic.id} to={`/forum/${topic.id}`} className="block">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 justify-between px-6 py-4 hover:bg-purple-50 transition">
                <div>
                  <div className="font-semibold text-lg text-purple-900 flex items-center gap-2">
                    {topic.title}
                    {(topic.hasAI || topic.has_ai_reply) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        🤖 AI Yanıtladı
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {topic.category} • {topic.author} • {(topic.date || topic.created_at || '').slice(0,10)}
                    {(topic.lastReply || topic.last_reply_at) && ` • Son yanıt: ${(topic.lastReply || topic.last_reply_at).slice(0,10)}`}
                  </div>
                </div>
                <div className="text-xs text-purple-700 font-bold">Yanıt: {topic.replies ?? topic.replies_count ?? 0}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage; 