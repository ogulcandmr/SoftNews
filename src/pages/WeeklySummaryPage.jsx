import React from 'react';
import WeeklySummary from '../components/WeeklySummary';

const WeeklySummaryPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 relative animate-fade-in-down">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-800 mb-6 drop-shadow">Bu Haftalık Özet</h1>
        <p className="text-gray-600 mb-6">AI tarafından oluşturulan, teknoloji ve yazılım dünyasındaki önemli gelişmelerin kısa özeti.</p>
        <WeeklySummary />
      </div>
    </div>
  );
};

export default WeeklySummaryPage;


