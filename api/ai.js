// Vercel Serverless - AI API (Netlify'den tam kopya)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const buckets = new Map();

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['client-ip'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  ).toString().split(',')[0].trim();
}

function isSafePrompt(messages = []) {
  const text = JSON.stringify(messages).toLowerCase();
  const banned = [
    'child sexual','csam','child abuse',
    'how to make bomb','how to make explosive',
    'credit card number','ssn:','social security:',
    'password:','api key:','secret key:',
    'malware code','ransomware code','exploit code'
  ];
  return !banned.some((k) => text.includes(k));
}

function selectProvider() {
  const provider = (process.env.VITE_AI_PROVIDER || process.env.AI_PROVIDER || 'groq').toLowerCase();
  if (provider === 'openai') {
    return {
      name: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      key: process.env.OPENAI_API_KEY,
      authHeader: (k) => `Bearer ${k}`,
    };
  }
  if (provider === 'openrouter') {
    return {
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      authHeader: (k) => `Bearer ${k}`,
      extraHeaders: {
        'HTTP-Referer': process.env.SITE_URL || 'https://softnews.vercel.app',
        'X-Title': 'SoftNews',
      },
    };
  }
  return {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: process.env.GROQ_API_KEY,
    authHeader: (k) => `Bearer ${k}`,
  };
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

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'AI function is working', 
      method: 'GET', 
      timestamp: new Date().toISOString() 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limit
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = buckets.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  buckets.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }

  const body = req.body || {};
  const {
    model = process.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
    messages = [],
    temperature = 0.3,
    max_tokens = 800,
  } = body;

  // Guardrails
  if (!isSafePrompt(messages)) {
    const mock = {
      id: 'softnews-guardrails',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body?.model || process.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
      choices: [{
        index: 0,
        message: { role: 'assistant', content: '- Bu içerik politikamız gereği özetlenemiyor. Lütfen konuyu daha genel ve güvenli terimlerle ifade edin.' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
    return res.status(200).json(mock);
  }

  // Provider
  const provider = selectProvider();
  if (!provider.key) {
    try {
      const lastUser = (messages || []).slice().reverse().find(m => m.role === 'user');
      const raw = (lastUser?.content || JSON.stringify(messages || '')).toString();
      const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean).slice(0, 20);
      const bullets = lines.map((s, i) => `- ${s.replace(/^[-•\s]+/, '')}`).slice(0, 7).join('\n');
      const mock = {
        id: 'softnews-mock-completion',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: bullets || '- Özet üretilemedi.' },
          finish_reason: 'stop',
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      return res.status(200).json(mock);
    } catch (e) {
      return res.status(500).json({ error: `AI fallback failed: ${e?.message || e}` });
    }
  }

  try {
    const reqHeaders = {
      'Content-Type': 'application/json',
      Authorization: provider.authHeader(provider.key),
      ...(provider.extraHeaders || {}),
    };

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const text = await response.text();
    res.status(response.status);
    return res.send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'AI proxy error' });
  }
}
