import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { fetchLatestNews } from '../services/newsService';
import { generateArticleSummary, generateArticleSections } from '../services/aiClient';

function formatViews(n) {
  if (!n && n !== 0) return '0';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'B';
  return String(num);
}

const allNews = [
  {
    id: '1',
    title: 'Yapay Zeka ile Kodlama Devrimi',
    description: 'Yapay zeka destekli araçlar yazılım geliştirmede devrim yaratıyor. Geliştiriciler artık daha hızlı ve verimli kod yazabiliyor.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Yapay Zeka',
    date: '2024-07-10',
    content: 'Yapay zeka ile kodlama artık çok daha hızlı ve verimli. Geliştiriciler, AI destekli araçlarla projelerini kısa sürede tamamlayabiliyor...'
  },
  {
    id: '2',
    title: 'Yeni Nesil Mobil İşlemciler',
    description: 'Mobil cihazlarda performans ve enerji verimliliği yeni nesil işlemcilerle zirveye çıkıyor.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    category: 'Donanım',
    date: '2024-07-09',
    content: 'Yeni nesil mobil işlemciler, pil ömrünü uzatırken performanstan ödün vermiyor...'
  },
  // ... diğer haberler ...
];

const NewsDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const article = location.state?.article;
  const navigate = useNavigate();
  const [allArticles, setAllArticles] = useState(allNews);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [articleText, setArticleText] = useState('');
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [sections, setSections] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState('');
  
  const news = article || allArticles.find(n => n.id === id);
  const related = allArticles.filter(n => n.category === news?.category && n.id !== id).slice(0, 4);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLatestNews().then((res) => {
      if (!mounted) return;
      if (res.ok && res.articles && res.articles.length > 0) {
        setAllArticles(res.articles);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Fetch full article text from source URL if available
  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const url = news?.url;
        if (!url) {
          setArticleText(news?.content || news?.description || '');
          return;
        }
        let res = await fetch(`/api/article?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          res = await fetch(`/.netlify/functions/article?url=${encodeURIComponent(url)}`);
        }
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const text = (data?.text || '').trim();
        setArticleText(text || news?.content || news?.description || '');
      } catch {
        if (!active) return;
        setArticleText(news?.content || news?.description || '');
      }
    }
    if (news) run();
    return () => { active = false; };
  }, [news]);

  // Build AI-driven sections once article text is ready
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!articleText || (articleText || '').trim().length < 80) return;
      setSectionsLoading(true);
      setSectionsError('');
      try {
        const res = await generateArticleSections({ title: news?.title || '', text: articleText });
        if (!alive) return;
        if (res.ok) setSections(res.sections || null);
        else setSectionsError(res.error || 'AI bölümleri üretilemedi');
      } catch (e) {
        if (!alive) return;
        setSectionsError('AI bölümleri üretilemedi');
      }
      if (alive) setSectionsLoading(false);
    }
    run();
    return () => { alive = false; };
  }, [articleText, news?.title]);

  // Fetch related videos by news title
  useEffect(() => {
    let on = true;
    async function load() {
      try {
        setRelatedLoading(true);
        const q = encodeURIComponent(news?.title || news?.category || 'teknoloji');
        let res = await fetch(`/api/youtube?q=${q}&max=9`);
        if (!res.ok) res = await fetch(`/.netlify/functions/youtube?q=${q}&max=9`);
        const data = await res.json().catch(() => ({ items: [] }));
        if (!on) return;
        const items = (data?.items || []).map(v => ({
          id: v.id,
          title: v.title,
          description: v.description,
          embedUrl: v.embedUrl || `https://www.youtube.com/embed/${v.id}`,
          watchUrl: v.url || `https://www.youtube.com/watch?v=${v.id}`,
          category: v.category || 'Teknoloji',
          views: Number(v.views || 0),
        }));
        setRelatedVideos(items);
      } catch (e) {
        if (!on) return;
        setRelatedVideos([]);
      } finally {
        if (on) setRelatedLoading(false);
      }
    }
    if (news?.title) load();
    return () => { on = false; };
  }, [news?.title]);

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Haber Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Bu haber mevcut değil veya kaldırılmış olabilir.</p>
          <button 
            onClick={() => navigate('/news')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Haberlere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="m-6 text-blue-600 hover:text-blue-800 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
          
          <div className="px-6 pb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {news.category}
              </span>
              <span className="ml-3 text-gray-500 text-sm">{news.date}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{news.title}</h1>
            
            <img 
              src={news.image || news.urlToImage} 
              alt={news.title} 
              className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg" 
            />
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                {(articleText && articleText.length > 300) ? articleText : (news.content || news.description)}
              </p>

              {/* AI-driven sections */}
              {sectionsLoading && (
                <div className="mt-6 space-y-3">
                  <div className="h-6 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
                </div>
              )}
              {!sectionsLoading && sections && (
                <div className="mt-8 space-y-8">
                  {sections.details && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Gelişmenin Detayları
                      </h2>
                      <p className="text-gray-800 leading-relaxed text-lg">{sections.details}</p>
                    </div>
                  )}
                  {sections.technical && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-l-4 border-green-500">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Teknik Özellikler
                      </h3>
                      <p className="text-gray-800 leading-relaxed">{sections.technical}</p>
                    </div>
                  )}
                  {sections.impacts && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-500">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Sektörel Etkiler
                      </h3>
                      <p className="text-gray-800 leading-relaxed">{sections.impacts}</p>
                    </div>
                  )}
                  {sections.outlook && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Gelecek Perspektifi
                      </h3>
                      <p className="text-gray-800 leading-relaxed">{sections.outlook}</p>
                    </div>
                  )}
                  {Array.isArray(sections.keyPoints) && sections.keyPoints.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-l-4 border-yellow-500">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Önemli Noktalar
                      </h3>
                      <ul className="space-y-2">
                        {sections.keyPoints.map((kp, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">{i+1}</span>
                            <span className="text-gray-800 leading-relaxed flex-1">{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {sectionsError && (
                <div className="mt-4 text-sm text-red-600">{sectionsError}</div>
              )}

              {news.url && (
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Haber Kaynağı:</p>
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium underline break-all text-sm"
                      >
                        {news.source?.name || new URL(news.url).hostname}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">Orijinal haberi okumak için tıklayın</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Related Articles */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                İlgili Haberler
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : related.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map(r => (
                <div key={r.id} className="group cursor-pointer" onClick={() => {
                  navigate(`/news/${r.id}`, { state: { article: r } });
                  // Scroll to top when navigating to new article
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <NewsCard {...r} />
                </div>
              ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>İlgili haber bulunamadı.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Related Videos */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">İlgili Videolar</h3>
              {relatedLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_,i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : relatedVideos.length === 0 ? (
                <div className="text-gray-500 text-sm">Video bulunamadı.</div>
              ) : (
                <div className="space-y-4">
                  {relatedVideos.slice(0,5).map(v => (
                    <a key={v.id} href={v.watchUrl} target="_blank" rel="noreferrer" className="block group">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                        <iframe src={v.embedUrl} title={v.title} className="w-full h-full" allowFullScreen />
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-2">{v.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{v.category} • {formatViews(v.views)} görüntüleme</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* AI Features */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Asistanı
              </h3>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    setAiError('');
                    setAiLoading(true);
                    try {
                      const res = await generateArticleSummary({ title: news.title, text: articleText || news.content || news.description || '' });
                      if (res.ok) setAiSummary(res.content || '');
                      else setAiError('AI özeti üretilemedi.');
                    } catch (e) {
                      setAiError('AI özeti üretilemedi.');
                    }
                    setAiLoading(false);
                  }}
                  disabled={aiLoading}
                  className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                >
                  {aiLoading ? 'Özet oluşturuluyor…' : 'Bu Haberi AI ile Özetle'}
                </button>
                {aiError && <div className="text-sm text-red-600">{aiError}</div>}
                {aiSummary && (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg whitespace-pre-wrap">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Haber İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kategori</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {news.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tarih</span>
                  <span className="text-sm font-semibold">{news.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kaynak</span>
                  <span className="text-sm font-semibold truncate max-w-24">
                    {news.source?.name || 'SoftNews'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Okuma Süresi</span>
                  <span className="text-sm font-semibold">~3 dk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage; 