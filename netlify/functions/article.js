// Lightweight article extractor without heavy deps
// Tries to extract <article> content or multiple <p> blocks and returns plain text

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function stripTags(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickLongestText(parts = []) {
  return parts
    .map((x) => x.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || '';
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  }

  const url = new URL(event.rawUrl || event.path, 'http://localhost');
  const target = url.searchParams.get('url');
  if (!target) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'url param required' }) };
  }

  try {
    const res = await fetch(target, { redirect: 'follow' });
    if (!res.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, title: '', text: '', source: target }) };
    }
    const html = await res.text();

    // Try to find article tag
    let articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
    let articleHtml = articleMatch ? articleMatch[0] : '';

    // If no article, collect many <p> blocks near main content
    let paragraphs = [];
    if (!articleHtml) {
      const pMatches = html.match(/<p[\s\S]*?<\/p>/gi) || [];
      // pick top 40 paragraphs
      paragraphs = pMatches.slice(0, 40).map((p) => stripTags(p));
    }

    const text = articleHtml ? stripTags(articleHtml) : paragraphs.join('\n\n');

    // Try a few title candidates
    const title = pickLongestText([
      (html.match(/<title>([\s\S]*?)<\/title>/i) || [,''])[1],
      (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i) || [,''])[1],
      (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [,''])[1],
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, title: title || '', text: text || '', source: target }),
    };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, title: '', text: '', source: target }) };
  }
};
