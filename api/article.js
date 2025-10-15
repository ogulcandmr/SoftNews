// Vercel Serverless - Article API (Netlify'den tam kopya)
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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ ok: false, error: 'url param required' });
  }

  try {
    const response = await fetch(target, { redirect: 'follow' });
    if (!response.ok) {
      return res.status(200).json({ ok: true, title: '', text: '', source: target });
    }
    const html = await response.text();

    // Simple regex-based extraction (no DOM parser needed)
    let bestText = '';
    
    // Try to extract article content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      bestText = stripTags(articleMatch[1]);
    }
    
    // Fallback: collect all <p> tags
    if (!bestText || bestText.length < 200) {
      const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      bestText = paragraphs
        .map(p => stripTags(p))
        .filter(t => t.length > 20)
        .join('\n\n');
    }

    const text = bestText || '';

    // Extract title
    const title = pickLongestText([
      (html.match(/<title>([\s\S]*?)<\/title>/i) || [,''])[1],
      (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i) || [,''])[1],
      (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [,''])[1],
    ]);

    return res.status(200).json({ 
      ok: true, 
      title: stripTags(title) || '', 
      text: text || '', 
      source: target 
    });
  } catch (e) {
    return res.status(200).json({ ok: true, title: '', text: '', source: target });
  }
}
