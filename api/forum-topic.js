// Vercel Serverless - Forum Topic Detail (query param: ?id=123)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'id required' });

  try {
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (topicError) throw topicError;

    const { data: replies, error: repliesError } = await supabase
      .from('replies')
      .select('*')
      .eq('topic_id', id)
      .order('created_at', { ascending: true })
      .limit(200);
    
    if (repliesError) throw repliesError;

    return res.status(200).json({ 
      success: true, 
      data: { topic, replies: replies || [] } 
    });
  } catch (err) {
    console.error('Forum topic detail error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
