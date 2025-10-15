// Vercel Serverless - Forum Auto Reply (query param: ?id=123)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function callAI(messages) {
  try {
    // Use Groq API directly instead of internal /api/ai call
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return { ok: false, error: 'Missing GROQ_API_KEY' };
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({ 
        model: 'llama-3.1-8b-instant',
        messages, 
        temperature: 0.35, 
        max_tokens: 500 
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Groq API error:', errorText);
      return { ok: false, error: 'AI API failed' };
    }
    
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { ok: true, content };
  } catch (e) {
    console.error('AI call error:', e);
    return { ok: false, error: e.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'id required' });

  try {
    const { data: topic, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !topic) {
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

    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .insert([{ 
        topic_id: id, 
        content: ai.content || 'AI yanıtı oluşturulamadı.', 
        author: 'softnews-ai', 
        ai_generated: true 
      }])
      .select()
      .single();
    
    if (replyError) throw replyError;

    return res.status(201).json({ success: true, data: reply });
  } catch (err) {
    console.error('Forum auto-reply error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
