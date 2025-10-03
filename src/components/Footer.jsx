import React from 'react';

const Footer = () => (
  <footer className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-8 mt-16">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-lg font-bold">SoftNews</div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-blue-200 transition"><i className="fab fa-twitter">twitter</i></a>
        <a href="#" className="hover:text-blue-200 transition"><i className="fab fa-instagram">instagram</i></a>
        <a href="#" className="hover:text-blue-200 transition"><i className="fab fa-github">github</i></a>
      </div>
      <div className="text-sm">© 2024 SoftNews. Tüm hakları saklıdır.</div>
    </div>
  </footer>
);

export default Footer; 