// AI client with environment-driven configuration and safe defaults.
// In production, route requests through a backend proxy at /api/ai.

const DEFAULT_PROVIDER_NAME = 'openai-compatible';

function getConfig() {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/api/ai';
  const model = import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant';
  const provider = import.meta.env.VITE_AI_PROVIDER || DEFAULT_PROVIDER_NAME;
  return { endpoint, model, provider };
}

async function callAI({ messages, temperature = 0.3, maxTokens = 500 }) {
  const { endpoint, model } = getConfig();

  // Always use backend proxy - no frontend API key needed
  const isProxyEndpoint = typeof endpoint === 'string' && endpoint.startsWith('/');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'AI request failed');
    }

    const data = await res.json();

    // Try to be compatible with OpenAI-like responses
    const content =
      data?.choices?.[0]?.message?.content || data?.content || data?.text || '';
    const usage = data?.usage || {};
    return { ok: true, content, usage };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Unknown AI error',
    };
  }
}

export async function generateWeeklySummary({ contextText }) {
  const system =
    'Sen SoftNews için Türkçe konuşan bir teknoloji editörüsün. ' +
    'Görevin: son günlerde yazılım, donanım, yapay zeka ve girişim dünyasındaki gelişmeleri kısa ve öz, maddeler halinde özetlemek. ' +
    'Doğrulanmamış bilgileri kesin gerçek gibi sunma. Ton: bilgilendirici, tarafsız.';

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
  const system =
    'Sen SoftNews için Türkçe konuşan bir yardımcısın. ' +
    'Odak alanları: yazılım, donanım, yapay zeka, girişimler ve teknoloji haberleri. ' +
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


