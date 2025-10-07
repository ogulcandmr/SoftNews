// Centralized dummy news data for reuse across pages and AI context.

export const newsItems = [
  {
    id: 1,
    title: 'Yapay Zeka ile Kodlama Devrimi',
    description:
      'Yapay zeka destekli araçlar yazılım geliştirmede devrim yaratıyor. Geliştiriciler artık daha hızlı ve verimli kod yazabiliyor.',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Yapay Zeka',
    date: '2024-07-10',
  },
  {
    id: 2,
    title: 'Yeni Nesil Mobil İşlemciler',
    description:
      'Mobil cihazlarda performans ve enerji verimliliği yeni nesil işlemcilerle zirveye çıkıyor.',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    category: 'Donanım',
    date: '2024-07-09',
  },
  {
    id: 3,
    title: 'Oyun Dünyasında Büyük Yenilik',
    description:
      'Oyun motorları ve grafik teknolojilerindeki gelişmeler, oyun deneyimini bambaşka bir seviyeye taşıyor.',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Oyun',
    date: '2024-07-08',
  },
  {
    id: 4,
    title: 'Yazılımda Uzaktan Çalışma Trendleri',
    description:
      'Uzaktan çalışma kültürü yazılım sektöründe kalıcı hale geliyor. Şirketler hibrit ve remote modelleri benimsiyor.',
    image:
      'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80',
    category: 'Yazılım',
    date: '2024-07-07',
  },
  {
    id: 5,
    title: 'Startuplarda Yatırım Rüzgarı',
    description:
      "Teknoloji girişimleri 2024'te rekor yatırım aldı. Yeni unicorn'lar yolda.",
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    category: 'Startup',
    date: '2024-07-06',
  },
  {
    id: 6,
    title: 'Mobil Uygulama Güvenliği',
    description:
      'Mobil uygulamalarda güvenlik açıkları ve alınması gereken önlemler.',
    image:
      'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80',
    category: 'Mobil',
    date: '2024-07-05',
  },
];

export function getNewsContextText(limit = 12) {
  const items = newsItems.slice(0, limit);
  return items
    .map(
      (n) => `- [${n.date}] (${n.category}) ${n.title}: ${n.description}`
    )
    .join('\n');
}


