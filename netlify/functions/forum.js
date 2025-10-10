const db = require('../../src/lib/database');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function parsePath(path = '') {
  // Supported:
  // /api/forum/topics
  // /api/forum/topics/:id
  // /api/forum/topics/:id/replies
  // /api/forum/topics/:id/auto-reply
  const parts = path.split('/').filter(Boolean);
  const idx = parts.indexOf('forum');
  const rest = idx >= 0 ? parts.slice(idx + 1) : [];
  return rest; // e.g. ['topics'], ['topics','123','replies']
}

async function callAI(messages) {
  // Use our existing AI proxy function
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8889';
  const aiUrl = `${base}/.netlify/functions/ai`;
  try {
    const res = await fetch(aiUrl, {
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

exports.handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path || '';
  const method = event.httpMethod;
  const seg = parsePath(path);

  try {
    // /api/forum/topics
    if (seg.length === 1 && seg[0] === 'topics') {
      if (method === 'GET') {
        const items = await db.listTopics({ limit: 50 });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: items }) };
      }
      if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const { title, category = 'Genel', content = '', author = 'guest' } = body;
        if (!title) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'title gereklidir' }) };
        const created = await db.createTopic({ title, category, content, author });
        return { statusCode: 201, headers, body: JSON.stringify({ success: true, data: created }) };
      }
      return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
    }

    // /api/forum/topics/:id
    if (seg.length === 2 && seg[0] === 'topics') {
      const topicId = seg[1];
      if (method === 'GET') {
        const topic = await db.getTopicById(topicId);
        const replies = await db.listReplies(topicId, { limit: 200 });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: { topic, replies } }) };
      }
      return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
    }

    // /api/forum/topics/:id/replies
    if (seg.length === 3 && seg[0] === 'topics' && seg[2] === 'replies') {
      const topicId = seg[1];
      if (method === 'GET') {
        const replies = await db.listReplies(topicId, { limit: 200 });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: replies }) };
      }
      if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const { content, author = 'guest' } = body;
        if (!content) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'content gereklidir' }) };
        const created = await db.createReply({ topic_id: topicId, content, author, ai_generated: false });
        return { statusCode: 201, headers, body: JSON.stringify({ success: true, data: created }) };
      }
      return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
    }

    // /api/forum/topics/:id/auto-reply
    if (seg.length === 3 && seg[0] === 'topics' && seg[2] === 'auto-reply') {
      const topicId = seg[1];
      if (method !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
      }
      const topic = await db.getTopicById(topicId);
      if (!topic) {
        return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Topic not found' }) };
      }
      const system = 'Sen SoftNews forumunda Türkçe konuşan yardımcı bir asistansın. Konuya yapıcı, kaynak öneren, kısa ve uygulanabilir bir yanıt yaz.';
      const user = `Konu başlığı: ${topic.title}\nKategori: ${topic.category}\nİçerik: ${topic.content || ''}\n\nLütfen 2-4 madde halinde kısa öneriler ve olası çözüm yolları yaz.`;
      const ai = await callAI([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      if (!ai.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: ai.error || 'AI failed' }) };
      }
      const created = await db.createReply({ topic_id: topicId, content: ai.content || 'AI yanıtı oluşturulamadı.', author: 'softnews-ai', ai_generated: true });
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, data: created }) };
    }

    // Not found
    return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'Endpoint bulunamadı.' }) };
  } catch (err) {
    console.error('Forum function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message || 'Server error' }) };
  }
};
