import React from 'react';

const NewsCard = ({ id, title, description, image, category, date }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg card-animate overflow-hidden group cursor-pointer border border-gray-100">
      <img src={image} alt={title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="p-4">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{category}</span>
        <h3 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
        <p className="mt-1 text-gray-600 text-sm line-clamp-3">{description}</p>
        <div className="mt-3 text-xs text-gray-400">{date}</div>
      </div>
    </div>
  );
};

export default NewsCard; 