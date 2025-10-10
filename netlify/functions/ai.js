// netlify/functions/ai.js

exports.handler = async function (event) {
  // ✅ Basit test endpoint'i (GET isteği)
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'AI function is working',
        method: 'GET',
        timestamp: new Date().toISOString()
      })
    };
  }

  // ✅ Sadece POST isteklerini kabul et
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // ✅ Ortam değişkenlerini al
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const AI_API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // Groq endpoint

  if (!GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GROQ_API_KEY' })
    };
  }

  try {
    // ✅ İstek gövdesini çözümle
    const body = JSON.parse(event.body || '{}');
    const {
      model = 'llama-3.1-8b-instant', // Groq destekli model
      messages = [],
      temperature = 0.3,
      max_tokens = 800
    } = body;

    // ✅ Groq API’ye istek gönder
    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens })
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'AI proxy error' })
    };
  }
};