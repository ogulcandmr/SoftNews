// Vercel Serverless - Forum Topics
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { data: topics, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Her topic için reply sayısını hesapla
      const topicsWithCounts = await Promise.all(
        (topics || []).map(async (topic) => {
          const { count } = await supabase
            .from('replies')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);
          
          return {
            ...topic,
            replies_count: count || 0
          };
        })
      );
      
      return res.status(200).json({ success: true, data: topicsWithCounts });
    }

    if (req.method === 'POST') {
      const { title, category = 'Genel', content = '', author = 'guest' } = req.body || {};
      if (!title) return res.status(400).json({ success: false, message: 'title gereklidir' });

      const { data, error } = await supabase
        .from('topics')
        .insert([{ title, category, content, author }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Yeni topic için replies_count ekle
      const topicWithCount = {
        ...data,
        replies_count: 0
      };
      
      return res.status(201).json({ success: true, data: topicWithCount });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('Forum topics error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
