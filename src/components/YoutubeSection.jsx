import React, { useState, useEffect } from 'react';

const VIDEO_CACHE_KEY = 'softnews_related_videos_v1';
const VIDEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 saat

function loadCache() {
  try {
    const raw = localStorage.getItem(VIDEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.videos || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > VIDEO_CACHE_TTL_MS) return null;
    return parsed.videos;
  } catch {
    return null;
  }
}

function saveCache(videos) {
  try {
    localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify({ videos, timestamp: Date.now() }));
  } catch {}
}

const YouTubeSection = ({ query = 'teknoloji haberleri' }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check cache
    const cached = loadCache();
    if (cached && cached.length > 0) {
      setVideos(cached.slice(0, 3));
      setLoading(false);
      return;
    }

    // Fetch from API
    fetch(`/api/youtube?q=${encodeURIComponent(query)}&max=6`)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        const items = (data?.items || []).slice(0, 3).map(v => ({
          id: v.id,
          title: v.title,
          embedUrl: v.embedUrl || `https://www.youtube.com/embed/${v.id}`,
        }));
        setVideos(items);
        if (items.length > 0) saveCache(items);
      })
      .catch(() => {
        // Fallback videos
        if (!mounted) return;
        setVideos([
          { id: 'MB26JRTbdKE', title: 'Yapay Zeka', embedUrl: 'https://www.youtube.com/embed/MB26JRTbdKE' },
          { id: 'hc-yBuo057E', title: 'Teknoloji', embedUrl: 'https://www.youtube.com/embed/hc-yBuo057E' },
        ]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [query]);

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="mb-4 text-xl font-bold text-blue-700">İlgili Videolar</h3>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="w-full h-72 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="mb-4 text-xl font-bold text-blue-700">İlgili Videolar</h3>
        <div className="grid grid-cols-1 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={video.embedUrl}
                title={video.title}
                allowFullScreen
                className="w-full h-72 md:h-96"
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSection;