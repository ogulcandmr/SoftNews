// netlify/functions/ai.js

// In-memory rate limit store (per cold start)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests per minute per IP
const buckets = new Map();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function getClientIp(event) {
  return (
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    event.ip ||
    'unknown'
  ).toString().split(',')[0].trim();
}

function isSafePrompt(messages = []) {
  const text = JSON.stringify(messages).toLowerCase();
  // Very simple guardrails (expand as needed)
  const banned = [
    'violence', 'terror', 'explosive', 'weapon', 'harm', 'hate',
    'child sexual', 'csam', 'suicide', 'self-harm'
  ];
  return !banned.some((k) => text.includes(k));
}

function selectProvider() {
  // Provider selection via environment
  // Expected values: 'groq' | 'openai' | 'openrouter'
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
        'HTTP-Referer': process.env.SITE_URL || 'https://softnew.netlify.app',
        'X-Title': 'SoftNews',
      },
    };
  }
  // default: groq (OpenAI-compatible)
  return {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: process.env.GROQ_API_KEY,
    authHeader: (k) => `Bearer ${k}`,
  };
}

exports.handler = async function (event) {
  const headers = corsHeaders();

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Health check
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'AI function is working', method: 'GET', timestamp: new Date().toISOString() }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Rate limit
  const ip = getClientIp(event);
  const now = Date.now();
  const entry = buckets.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  buckets.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
    };
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    body = {};
  }

  const {
    model = process.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
    messages = [],
    temperature = 0.3,
    max_tokens = 800,
  } = body;

  // Guardrails: if unsafe, reply with a neutral safe message instead of 400
  if (!isSafePrompt(messages)) {
    const mock = {
      id: 'softnews-guardrails',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body?.model || process.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: '- Bu içerik politikamız gereği özetlenemiyor. Lütfen konuyu daha genel ve güvenli terimlerle ifade edin.' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
    return { statusCode: 200, headers, body: JSON.stringify(mock) };
  }

  // Provider
  const provider = selectProvider();
  if (!provider.key) {
    // Local fallback summary when API key is missing
    try {
      const lastUser = (messages || []).slice().reverse().find(m => m.role === 'user');
      const raw = (lastUser?.content || JSON.stringify(messages || '')).toString();
      const lines = raw
        .split(/\n+/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 20);
      const bullets = lines
        .map((s, i) => `- ${s.replace(/^[-•\s]+/, '')}`)
        .slice(0, 7)
        .join('\n');
      const mock = {
        id: 'softnews-mock-completion',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: bullets || '- Özet üretilemedi.' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      return { statusCode: 200, headers, body: JSON.stringify(mock) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: `AI fallback failed: ${e?.message || e}` }) };
    }
  }

  try {
    const reqHeaders = {
      'Content-Type': 'application/json',
      Authorization: provider.authHeader(provider.key),
      ...(provider.extraHeaders || {}),
    };

    const res = await fetch(provider.url, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const text = await res.text();
    return { statusCode: res.status, headers, body: text };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'AI proxy error' }) };
  }
};