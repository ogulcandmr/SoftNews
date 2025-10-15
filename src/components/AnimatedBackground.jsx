import React from 'react';

const AnimatedBackground = ({ variant = 'mesh' }) => {
  if (variant === 'mesh') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl animate-blob animation-delay-3000"></div>
        </div>
        
        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.4}} />
              <stop offset="100%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.4}} />
            </linearGradient>
          </defs>
          <path d="M0,50 Q250,100 500,50 T1000,50" stroke="url(#grad1)" strokeWidth="2" fill="none" className="animate-pulse" />
          <path d="M0,150 Q250,200 500,150 T1000,150" stroke="url(#grad1)" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '1s'}} />
          <path d="M0,250 Q250,300 500,250 T1000,250" stroke="url(#grad1)" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '2s'}} />
        </svg>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 dark:bg-pink-500 rounded-full animate-float animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-float animation-delay-3000"></div>
      </div>
    );
  }

  // Fallback to simple blobs
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-70 dark:opacity-40 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-70 dark:opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-70 dark:opacity-40 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default AnimatedBackground;
