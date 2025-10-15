// Vercel Serverless - Forum API (Netlify'den tam kopya, Supabase ile)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const db = {
  async listTopics({ limit = 50 }) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
  
  async createTopic({ title, category, content, author }) {
    const { data, error } = await supabase
      .from('topics')
      .insert([{ title, category, content, author }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async getTopicById(id) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  async listReplies(topicId, { limit = 200 }) {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
  
  async createReply({ topic_id, content, author, ai_generated }) {
    const { data, error } = await supabase
      .from('replies')
      .insert([{ topic_id, content, author, ai_generated }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

function parsePath(path = '') {
  const parts = path.split('/').filter(Boolean);
  const idx = parts.indexOf('forum');
  const rest = idx >= 0 ? parts.slice(idx + 1) : [];
  return rest;
}

async function callAI(messages) {
  try {
    const res = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.35, max_tokens: 500 }),
    });
    const data = await res.json().catch(() => ({}));
    const content = data?.choices?.[0]?.message?.content || data?.content || '';
    return { ok: res.ok, content, raw: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '';
  const method = req.method;
  const seg = parsePath(path);

  try {
    // /api/forum/topics
    if (seg.length === 1 && seg[0] === 'topics') {
      if (method === 'GET') {
        const items = await db.listTopics({ limit: 50 });
        return res.status(200).json({ success: true, data: items });
      }
      if (method === 'POST') {
        const body = req.body || {};
        const { title, category = 'Genel', content = '', author = 'guest' } = body;
        if (!title) {
          return res.status(400).json({ success: false, message: 'title gereklidir' });
        }
        const created = await db.createTopic({ title, category, content, author });
        return res.status(201).json({ success: true, data: created });
      }
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // /api/forum/topics/:id
    if (seg.length === 2 && seg[0] === 'topics') {
      const topicId = seg[1];
      if (method === 'GET') {
        const topic = await db.getTopicById(topicId);
        const replies = await db.listReplies(topicId, { limit: 200 });
        return res.status(200).json({ success: true, data: { topic, replies } });
      }
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // /api/forum/topics/:id/replies
    if (seg.length === 3 && seg[0] === 'topics' && seg[2] === 'replies') {
      const topicId = seg[1];
      if (method === 'GET') {
        const replies = await db.listReplies(topicId, { limit: 200 });
        return res.status(200).json({ success: true, data: replies });
      }
      if (method === 'POST') {
        const body = req.body || {};
        const { content, author = 'guest' } = body;
        if (!content) {
          return res.status(400).json({ success: false, message: 'content gereklidir' });
        }
        const created = await db.createReply({ topic_id: topicId, content, author, ai_generated: false });
        return res.status(201).json({ success: true, data: created });
      }
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // /api/forum/topics/:id/auto-reply
    if (seg.length === 3 && seg[0] === 'topics' && seg[2] === 'auto-reply') {
      const topicId = seg[1];
      if (method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
      }
      const topic = await db.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }
      const system = 'Sen SoftNews forumunda Türkçe konuşan yardımcı bir asistansın. Konuya yapıcı, kaynak öneren, kısa ve uygulanabilir bir yanıt yaz.';
      const user = `Konu başlığı: ${topic.title}\nKategori: ${topic.category}\nİçerik: ${topic.content || ''}\n\nLütfen 2-4 madde halinde kısa öneriler ve olası çözüm yolları yaz.`;
      const ai = await callAI([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      if (!ai.ok) {
        return res.status(400).json({ success: false, message: ai.error || 'AI failed' });
      }
      const created = await db.createReply({ topic_id: topicId, content: ai.content || 'AI yanıtı oluşturulamadı.', author: 'softnews-ai', ai_generated: true });
      return res.status(201).json({ success: true, data: created });
    }

    return res.status(404).json({ success: false, message: 'Endpoint bulunamadı.' });
  } catch (err) {
    console.error('Forum function error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}
