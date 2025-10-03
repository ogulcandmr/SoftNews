import React from 'react';

const videos = [
  {
    title: 'Yapay Zeka ile Kodlama',
    url: 'https://www.youtube.com/embed/MB26JRTbdKE',
  },
  {
    title: 'Teknoloji Girişimleri',
    url: 'https://www.youtube.com/embed/hc-yBuo057E',
  },
  {
    title: 'Mobil Uygulama Geliştirme',
    url: 'https://www.youtube.com/embed/2Ji-clqUYnA',
  },
  {
    title: 'Oyun Programlama',
    url: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
  },
  {
    title: 'Oyun Programlama',
    url: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
  }, {
    title: 'Oyun Programlama',
    url: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
  },
];

const VideosPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center drop-shadow">Videolar</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {videos.map((video, i) => (
            <div key={i} className="rounded-2xl shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  className="w-full h-64 md:h-80"
                ></iframe>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{video.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosPage; 