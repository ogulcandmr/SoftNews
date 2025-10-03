import React, { useEffect } from 'react';

const ToastMessage = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[2000] px-6 py-3 rounded-lg shadow-lg text-white text-base font-semibold transition-all duration-300 animate-fade-in-down ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
      style={{ minWidth: 200 }}
    >
      {message}
    </div>
  );
};

export default ToastMessage; 