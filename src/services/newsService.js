export async function fetchLatestNews() {
  try {
    const res = await fetch('/api/news', { method: 'GET' });
    if (!res.ok) throw new Error('news request failed');
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || 'news error');
    const articles = (data.articles || []).map((a, idx) => ({
      id: idx + 1000,
      title: a.title || 'Başlık yok',
      description: a.description || a.content || '',
      image: a.urlToImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      category: 'Teknoloji',
      date: (a.publishedAt || '').slice(0, 10),
      url: a.url,
    }));
    return { ok: true, articles };
  } catch (e) {
    return { ok: false, error: e?.message || 'news error' };
  }
}


