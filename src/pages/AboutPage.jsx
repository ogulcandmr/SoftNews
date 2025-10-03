import React from 'react';

const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 relative animate-fade-in-down">
    <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/046/484/632/large_2x/y2k-abstract-background-design-aesthetic-curved-gradient-pastel-color-illustration-template-for-poster-banner-social-media-page-greeting-web-digital-free-vector.jpg')] bg-cover bg-center opacity-20 pointer-events-none" />
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Hakkımızda</h1>
      <p className="mb-4 text-gray-700">SoftNews, yazılım ve teknoloji dünyasındaki en güncel haberleri, videoları ve topluluk tartışmalarını bir araya getiren modern bir platformdur.</p>
      <h2 className="text-xl font-semibold text-purple-700 mb-2">Vizyonumuz</h2>
      <p className="mb-4 text-gray-700">Teknolojiye ilgi duyan herkesi bir araya getirmek, bilgi paylaşımını ve topluluk etkileşimini artırmak.</p>
      <h2 className="text-xl font-semibold text-purple-700 mb-2">İletişim</h2>
      <p className="mb-2 text-gray-700">E-posta: iletisim@softnews.com</p>
      <p className="text-gray-700">Instagram: @softnews</p>
    </div>
  </div>
);

export default AboutPage; 