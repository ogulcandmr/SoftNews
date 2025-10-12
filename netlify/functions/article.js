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

    // Try common article containers with priority
    const selectors = [
      'article',
      '[role="main"] article',
      '.article-body',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article__body',
      '#article-body',
      '#content article',
      'main article',
      '.content',
      'main',
      'section'
    ];

    let bestText = '';
    let bestEl = null;
    for (const sel of selectors) {
      const el = dom.window.document.querySelector(sel);
      if (el) {
        const text = el.textContent || '';
        if (text.length > bestText.length) {
          bestText = text;
          bestEl = el;
        }
      }
    }

    // Enhanced extraction: get all paragraphs from best container
    if (bestEl) {
      const paragraphs = Array.from(bestEl.querySelectorAll('p, h2, h3, h4, li'));
      const richText = paragraphs
        .map(p => p.textContent.trim())
        .filter(t => t.length > 20) // Filter out very short fragments
        .join('\n\n');
      if (richText.length > bestText.length) bestText = richText;
    }

    // Fallback: collect all <p> tags from entire document
    if (!bestText || bestText.length < 200) {
      const paragraphs = Array.from(dom.window.document.querySelectorAll('p'));
      bestText = paragraphs
        .map(p => p.textContent.trim())
        .filter(t => t.length > 20)
        .join('\n\n');
    }

    const text = bestText || '';

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
