// Vercel Serverless Function - AI
const buckets = new Map();

function selectProvider() {
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
  if (provider === 'openai') {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      key: process.env.OPENAI_API_KEY,
      authHeader: (k) => `Bearer ${k}`,
    };
  }
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: process.env.GROQ_API_KEY,
    authHeader: (k) => `Bearer ${k}`,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { model = 'llama-3.1-8b-instant', messages = [], temperature = 0.3, max_tokens = 800 } = req.body || {};

  const provider = selectProvider();
  if (!provider.key) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': provider.authHeader(provider.key),
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
