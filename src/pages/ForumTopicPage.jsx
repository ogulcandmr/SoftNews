import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const dummyTopics = [
  {
    id: 1,
    title: 'Yazılımda Kariyer Planı Nasıl Yapılır?',
    category: 'Yazılım',
    author: 'ogulcan',
    date: '2024-07-10',
    content: 'Yazılımda kariyer planı yaparken hangi teknolojilere odaklanmalı, nasıl yol izlemeli?',
    replies: [
      { id: 1, author: 'ayse', date: '2024-07-10', text: 'Frontend ile başlamak mantıklı.' },
      { id: 2, author: 'mehmet', date: '2024-07-10', text: 'Backend de önemli, ikisini de öğren.' },
    ],
  },
  {
    id: 2,
    title: 'En iyi oyun motoru hangisi?',
    category: 'Oyun',
    author: 'ayse',
    date: '2024-07-09',
    content: 'Unity mi Unreal mı? Sizce hangisi daha iyi?',
    replies: [
      { id: 1, author: 'ogulcan', date: '2024-07-09', text: 'Unity yeni başlayanlar için daha kolay.' },
    ],
  },
];

const ForumTopicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = dummyTopics.find(t => t.id === Number(id));
  const [replies, setReplies] = useState(topic ? topic.replies : []);
  const [reply, setReply] = useState('');

  if (!topic) return <div className="text-center py-20 text-xl">Konu bulunamadı.</div>;

  const handleReply = e => {
    e.preventDefault();
    setReplies([
      ...replies,
      {
        id: replies.length + 1,
        author: 'guest',
        date: new Date().toISOString().slice(0, 10),
        text: reply,
      },
    ]);
    setReply('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-purple-600 hover:underline">&larr; Geri</button>
        <div className="mb-2 text-xs text-purple-700 font-semibold uppercase">{topic.category} • {topic.author} • {topic.date}</div>
        <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
        <p className="text-gray-700 mb-6">{topic.content}</p>
        <h2 className="text-lg font-bold mb-2 text-blue-700">Yanıtlar</h2>
        <div className="space-y-4 mb-6">
          {replies.length === 0 && <div className="text-gray-400">Henüz yanıt yok.</div>}
          {replies.map(r => (
            <div key={r.id} className="bg-blue-50 rounded p-3">
              <div className="text-xs text-blue-700 font-semibold mb-1">{r.author} • {r.date}</div>
              <div>{r.text}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleReply} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Yanıt yaz..."
            value={reply}
            onChange={e => setReply(e.target.value)}
            required
          />
          <button type="submit" className="px-5 py-2 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition">Gönder</button>
        </form>
      </div>
    </div>
  );
};

export default ForumTopicPage; 