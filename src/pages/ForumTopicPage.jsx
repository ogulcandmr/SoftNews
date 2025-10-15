import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

async function apiGetTopicWithReplies(id) {
  const res = await fetch(`/api/forum-topic?id=${id}`);
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Get topic failed');
  return data.data;
}

async function apiPostReply(id, content, author) {
  const res = await fetch(`/api/forum-replies?id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, author })
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Post reply failed');
  return data.data;
}

async function apiAutoReply(id) {
  const res = await fetch(`/api/forum-auto-reply?id=${id}`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Auto-reply failed');
  return data.data;
}

const ForumTopicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    apiGetTopicWithReplies(id)
      .then(({ topic, replies }) => {
        if (!mounted) return;
        setTopic(topic);
        // Map server replies (content/author/created_at) to UI shape (text/author/date)
        const mapped = (replies || []).map(r => ({
          id: r.id,
          author: r.author || 'guest',
          date: (r.created_at || '').slice(0,10),
          text: r.content,
        }));
        setReplies(mapped);
      })
      .catch((e) => {
        console.error('Load topic failed:', e);
        setError('Konu yüklenemedi.');
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      let author = 'guest';
      try {
        const raw = localStorage.getItem('softnews_user');
        if (raw) {
          const u = JSON.parse(raw);
          author = u?.name || u?.email || 'guest';
        }
      } catch {}
      const created = await apiPostReply(id, reply, author);
      setReplies(prev => [...prev, {
        id: created.id,
        author: created.author || author || 'guest',
        date: (created.created_at || '').slice(0,10),
        text: created.content,
      }]);
      setReply('');
    } catch (e) {
      console.error(e);
      alert('Yanıt gönderilemedi');
    }
  };

  const handleAutoReply = async () => {
    try {
      setAiBusy(true);
      const created = await apiAutoReply(id);
      setReplies(prev => [...prev, {
        id: created.id,
        author: created.author || 'softnews-ai',
        date: (created.created_at || '').slice(0,10),
        text: created.content,
      }]);
    } catch (e) {
      console.error(e);
      alert('AI yanıtı oluşturulamadı');
    } finally {
      setAiBusy(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Yükleniyor…</div>;
  if (error || !topic) return <div className="text-center py-20 text-xl">Konu bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative">
      <AnimatedBackground variant="mesh" />
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-purple-600 hover:underline">&larr; Geri</button>
        <div className="mb-2 text-xs text-purple-700 font-semibold uppercase">{topic.category} • {topic.author} • {(topic.created_at || '').slice(0,10)}</div>
        <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
        <p className="text-gray-700 mb-4">{topic.content}</p>
        <div className="flex gap-2 mb-6">
          <span className="text-xs text-gray-500">Yanıt sayısı: {topic.replies_count ?? replies.length}</span>
          <button onClick={handleAutoReply} disabled={aiBusy} className="text-xs px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">{aiBusy ? 'AI yazıyor…' : 'AI Yanıtla'}</button>
        </div>
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