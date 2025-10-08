import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateForumAutoReply } from '../services/aiClient';

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

const ForumPage = () => {
  const [selected, setSelected] = useState('Tümü');
  const [topics, setTopics] = useState(dummyTopics);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Genel' });
  const [aiProcessing, setAiProcessing] = useState(false);

  const filtered = selected === 'Tümü' ? topics : topics.filter(t => t.category === selected);

  // AI otomatik cevap kontrolü
  useEffect(() => {
    const checkForAIReplies = async () => {
      const topicsNeedingAI = topics.filter(topic => 
        topic.replies === 0 && 
        !topic.hasAI && 
        new Date() - new Date(topic.date) > 24 * 60 * 60 * 1000 // 24 saat geçmiş
      );

      if (topicsNeedingAI.length > 0) {
        setAiProcessing(true);
        
        for (const topic of topicsNeedingAI) {
          try {
            const aiReply = await generateForumAutoReply(topic.title, topic.category);
            if (aiReply) {
              setTopics(prevTopics => 
                prevTopics.map(t => 
                  t.id === topic.id 
                    ? { 
                        ...t, 
                        replies: t.replies + 1, 
                        lastReply: new Date().toISOString().slice(0, 10),
                        hasAI: true 
                      }
                    : t
                )
              );
            }
          } catch (error) {
            console.error('AI reply error:', error);
          }
        }
        
        setAiProcessing(false);
      }
    };

    checkForAIReplies();
  }, [topics]);

  const handleSubmit = e => {
    e.preventDefault();
    setTopics([
      {
        id: topics.length + 1,
        title: form.title,
        category: form.category,
        author: 'guest',
        date: new Date().toISOString().slice(0, 10),
        replies: 0,
        lastReply: null,
        hasAI: false,
      },
      ...topics,
    ]);
    setForm({ title: '', category: 'Genel' });
    setShowForm(false);
  };

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
            <button type="submit" className="self-end px-5 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition">Konu Oluştur</button>
          </form>
        )}
        <div className="bg-white rounded-xl shadow divide-y">
          {filtered.length === 0 && <div className="p-6 text-center text-gray-500">Hiç konu yok.</div>}
          {filtered.map(topic => (
            <Link key={topic.id} to={`/forum/${topic.id}`} className="block">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 justify-between px-6 py-4 hover:bg-purple-50 transition">
                <div>
                  <div className="font-semibold text-lg text-purple-900 flex items-center gap-2">
                    {topic.title}
                    {topic.hasAI && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        🤖 AI Yanıtladı
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {topic.category} • {topic.author} • {topic.date}
                    {topic.lastReply && ` • Son yanıt: ${topic.lastReply}`}
                  </div>
                </div>
                <div className="text-xs text-purple-700 font-bold">Yanıt: {topic.replies}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage; 