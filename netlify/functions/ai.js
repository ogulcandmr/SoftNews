exports.handler = async function (event) {
  // Allow both GET and POST for testing
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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';

  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { model = 'llama-3.1-8b-instant', messages = [], temperature = 0.3, max_tokens = 800 } = body;

    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const text = await res.text();
    return { statusCode: res.status, body: text };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || 'AI proxy error' }) };
  }
};
