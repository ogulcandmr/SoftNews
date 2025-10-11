import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { fetchLatestNews } from '../services/newsService';
import { generateArticleSummary } from '../services/aiClient';

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
        const res = await fetch(`/api/article?url=${encodeURIComponent(url)}`);
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
              
              {/* Extended article content */}
              <div className="mt-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gelişmenin Detayları</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bu önemli gelişme, teknoloji sektöründe yeni bir dönemin başlangıcı olarak değerlendiriliyor. 
                  Uzmanlar, bu yeniliğin gelecekteki projeler ve geliştirmeler üzerinde büyük etki yaratacağını 
                  belirtiyor. Sektördeki diğer şirketlerin de benzer adımlar atması bekleniyor.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Teknoloji dünyasında sürekli değişen dinamikler, bu tür yeniliklerin hızla yaygınlaşmasını 
                  sağlıyor. Kullanıcıların beklentileri artarken, geliştiriciler de daha yaratıcı çözümler 
                  üretmeye odaklanıyor. Bu süreçte, kalite ve performans standartları da sürekli yükseliyor.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Teknik Özellikler</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Sistemin teknik altyapısı, modern teknoloji standartlarına uygun olarak geliştirilmiş. 
                  Güvenlik, performans ve kullanılabilirlik açısından en yüksek standartları karşılayan 
                  bu çözüm, kullanıcı deneyimini ön planda tutuyor.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sektörel Etkiler</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bu gelişmenin, önümüzdeki dönemde teknoloji dünyasında yeni trendlerin oluşmasına 
                  katkı sağlayacağı öngörülüyor. Geliştiriciler ve teknoloji meraklıları için yeni 
                  fırsatlar sunacak bu yenilik, sektörün genel yönelimini de etkileyebilir.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Gelecek Perspektifi</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Uzun vadede, bu tür yeniliklerin teknoloji ekosistemini daha da zenginleştireceği 
                  düşünülüyor. Kullanıcıların ihtiyaçlarına daha iyi yanıt verebilen sistemler, 
                  dijital dönüşüm sürecini hızlandıracak ve yeni fırsatlar yaratacak.
                </p>
              </div>
              
              {/* Extended content for better detail */}
              <div className="mt-8 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Detaylı Analiz</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Bu gelişme, teknoloji sektöründe önemli bir dönüm noktası olarak değerlendiriliyor. 
                    Uzmanlar, bu tür yeniliklerin gelecekteki projeler ve geliştirmeler üzerinde 
                    büyük etki yaratacağını belirtiyor. Sektördeki diğer şirketlerin de benzer 
                    adımlar atması bekleniyor.
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Teknik Detaylar</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Modern teknoloji standartlarına uygun geliştirme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Kullanıcı deneyimini ön planda tutan tasarım yaklaşımı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Güvenlik ve performans odaklı mimari</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Gelecek Etkileri</h3>
                  <p className="text-green-800 leading-relaxed">
                    Bu gelişmenin, önümüzdeki dönemde teknoloji dünyasında yeni trendlerin 
                    oluşmasına katkı sağlayacağı öngörülüyor. Geliştiriciler ve teknoloji 
                    meraklıları için yeni fırsatlar sunacak bu yenilik, sektörün genel 
                    yönelimini de etkileyebilir.
                  </p>
                </div>
              </div>
              
              {/* Additional Content Sections */}
              <div className="mt-8 space-y-6">
                {/* Key Points */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Önemli Noktalar
                  </h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Teknoloji sektöründe önemli bir gelişme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Geliştiriciler ve teknoloji meraklıları için değerli bilgi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Gelecekteki projeler için rehber niteliğinde</span>
                    </li>
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">#teknoloji</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">#{news.category?.toLowerCase()}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">#güncel</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">#haber</span>
                </div>

                {/* Social Share */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">Paylaş:</span>
                  <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {news.url && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Kaynak:</p>
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {news.url}
                  </a>
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
          <div className="space-y-6">
            {/* Video Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                İlgili Videolar
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {news.title?.slice(0, 50)}... - Teknoloji Analizi
                      </h4>
                      <p className="text-xs text-gray-600">YouTube • 5 dk</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {news.category} Trendleri 2024
                      </h4>
                      <p className="text-xs text-gray-600">YouTube • 8 dk</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        AI ve Gelecek Teknolojiler
                      </h4>
                      <p className="text-xs text-gray-600">YouTube • 12 dk</p>
                    </div>
                  </div>
                </div>
              </div>
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