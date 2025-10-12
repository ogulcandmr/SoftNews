// AI client with environment-driven configuration and safe defaults.
// In production, route requests through a backend proxy at /api/ai.

const DEFAULT_PROVIDER_NAME = 'openai-compatible';

function getConfig() {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/api/ai';
  const model = import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant';
  const provider = import.meta.env.VITE_AI_PROVIDER || DEFAULT_PROVIDER_NAME;
  return { endpoint, model, provider };
}

// Rich article-specific summary
export async function generateArticleSummary({ title, text }) {
  const { tone, length, focus } = getUserPreferences();
  const system =
    'Sen SoftNews için Türkçe konuşan kıdemli bir teknoloji editörüsün. ' +
    'Görevin: verilen haber metnini kaynak göstermeden, tarafsız ve detaylı biçimde özetlemek; ' +
    'önemli noktalar, teknik detaylar, sektörel etkiler ve gelecek perspektifini ayrı başlıklar altında vermek. ' +
    `Kullanıcı tercihleri → Ton: ${tone}; Uzunluk: ${length}; Odak: ${focus}. ` +
    'Yanıtı markdownsız, sade metin olarak ver. Gerektiğinde maddeler kullan.';

  const user =
    `Haber başlığı: ${title}\n\n` +
    `Haber metni:\n${text}\n\n` +
    'Çıktı bölümleri: \n' +
    '- Özet\n- Önemli Noktalar (madde madde)\n- Teknik Özellikler / Detaylar (varsa)\n- Sektörel Etkiler\n- Gelecek Perspektifi\n- Sonuç\n';

  return callAI({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
    maxTokens: 700,
  });
}

const PREFS_KEY = 'softnews_ai_prefs_v1';
export function getUserPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const p = raw ? JSON.parse(raw) : {};
    const tone = p.tone || 'tarafsız'; // 'resmi' | 'samimi' | 'tarafsız'
    const length = p.length || 'kısa'; // 'kısa' | 'orta' | 'uzun'
    const focus = p.focus || 'genel'; // 'yapay zeka' | 'yazılım' | 'donanım' | 'genel'
    return { tone, length, focus };
  } catch {
    return { tone: 'tarafsız', length: 'kısa', focus: 'genel' };
  }
}

async function callAI({ messages, temperature = 0.3, maxTokens = 500 }) {
  const { endpoint, model } = getConfig();

  async function postJson(url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-cache',
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    });
    return res;
  }

  try {
    // Attempt primary endpoint
    let res = await postJson(endpoint);
    if (!res.ok) {
      // Retry with Netlify functions path if proxy is not configured
      if (endpoint.startsWith('/api/ai')) {
        res = await postJson('/.netlify/functions/ai');
      }
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'AI request failed');
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || data?.content || data?.text || '';
    const usage = data?.usage || {};
    return { ok: true, content, usage };
  } catch (error) {
    return { ok: false, error: error?.message || 'Unknown AI error' };
  }
}

export async function generateWeeklySummary({ contextText }) {
  const { tone, length, focus } = getUserPreferences();
  const system =
    'Sen SoftNews için Türkçe konuşan bir teknoloji editörüsün. ' +
    'Görevin: son günlerde yazılım, donanım, yapay zeka ve girişim dünyasındaki gelişmeleri maddeler halinde özetlemek. ' +
    `Kullanıcı tercihleri → Ton: ${tone}; Uzunluk: ${length}; Odak: ${focus}. ` +
    'Doğrulanmamış bilgileri kesin gerçek gibi sunma. Ton: bilgilendirici, tarafsız kalmaya çalış.';

  const user =
    `İçerik bağlamı (haber özetleri veya başlıklar):\n${contextText}\n\n` +
    'Lütfen 5-7 madde halinde kısa bir haftalık özet üret. Her madde maksimum 1-2 cümle olsun.';

  return callAI({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.4,
    maxTokens: 450,
  });
}

export function buildNewsAwareMessages({ newsContextText, history = [], userInput }) {
  const { tone, length, focus } = getUserPreferences();
  const system =
    'Sen SoftNews için Türkçe konuşan bir yardımcısın. ' +
    'Odak alanları: yazılım, donanım, yapay zeka, girişimler ve teknoloji haberleri. ' +
    `Kullanıcı tercihleri → Ton: ${tone}; Uzunluk: ${length}; Odak: ${focus}. ` +
    'Bilmediğin konuda uydurma; emin değilsen "emin değilim" de ve yönlendir. ' +
    'Kısa ve öz yanıt ver. Gerektiğinde madde madde yaz.';

  const contextMsg = {
    role: 'user',
    content: `Bağlam (son haber başlıkları ve kısa özetler):\n${newsContextText}`,
  };

  const safeHistory = history.slice(-14); // keep last 14 turns for brevity
  const userMsg = { role: 'user', content: userInput };

  return [{ role: 'system', content: system }, contextMsg, ...safeHistory, userMsg];
}

export async function chatWithNewsContext({ newsContextText, history, userInput }) {
  const messages = buildNewsAwareMessages({ newsContextText, history, userInput });
  return callAI({ messages, temperature: 0.3, maxTokens: 800 });
}

export async function generateForumAutoReply({ topicTitle, topicContent }) {
  const system =
    'Sen SoftNews forumunda Türkçe konuşan yardımcı bir asistansın. ' +
    'Amacın, yanıtsız kalmış teknik konulara bilgilendirici, kaynak öneren ve saygılı bir ilk yanıt yazmak. ' +
    'Varsayım yapma, net değilsen alternatif yollar ve araştırma önerileri sun.';

  const user =
    `Konu başlığı: ${topicTitle}\n` +
    `Konu içeriği: ${topicContent}\n\n` +
    'Lütfen 2-5 madde halinde kısa, uygulanabilir öneriler ve olası çözüm yolları yaz. ' +
    'Uygunsa dokümantasyon/anahtar kelime arama önerileri de ekle.';

  return callAI({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
    maxTokens: 500,
  });
}

export function getAIConfigPublic() {
  const { provider, model } = getConfig();
  return { provider, model };
}

// Focused helper for video recommendations
export async function generateVideoRecommendations({ videoContextText }) {
  const { tone, length, focus } = getUserPreferences();
  const system =
    'Sen SoftNews için Türkçe konuşan bir video öneri asistanısın. ' +
    'Görevin: verilen video başlıkları, kısa açıklamaları ve URL bilgilerine göre izlenmeye değer öneriler üretmek. ' +
    `Kullanıcı tercihleri → Ton: ${tone}; Uzunluk: ${length}; Odak: ${focus}. ` +
    'Cevap formatı: 3-5 madde; her maddede kısa başlık — 1 cümlelik gerekçe — doğrudan video URL’i. Fazla laf kalabalığı yapma.';

  const user =
    `Video bağlamı (Başlık, Kısa Açıklama, URL):\n${videoContextText}\n\n` +
    'Lütfen çıktıdaki her maddeye sonuna doğrudan URL’yi ekle.';

  return callAI({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.35,
    maxTokens: 500,
  });
}


