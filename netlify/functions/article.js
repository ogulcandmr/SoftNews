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

    // Try to find main content containers
    const candidates = [];
    const patterns = [
      /<article[\s\S]*?<\/article>/gi,
      /<div[^>]+id=["'](?:content|main|article|post)["'][\s\S]*?<\/div>/gi,
      /<div[^>]+class=["'][^"']*(?:content|main|article|post|entry-content|post-content)[^"']*["'][\s\S]*?<\/div>/gi,
      /<section[\s\S]*?<\/section>/gi,
    ];
    for (const re of patterns) {
      const matches = html.match(re) || [];
      for (const m of matches) candidates.push(m);
    }
    let bestBlock = pickLongestText(candidates.map(stripTags));

    // If no good block found, collect many <p> blocks
    if (!bestBlock || bestBlock.length < 600) {
      const pMatches = html.match(/<p[\s\S]*?<\/p>/gi) || [];
      // pick more paragraphs to increase recall
      const paragraphs = pMatches.slice(0, 120).map((p) => stripTags(p));
      bestBlock = pickLongestText([bestBlock || '', paragraphs.join('\n\n')]);
    }

    const text = bestBlock || '';

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
