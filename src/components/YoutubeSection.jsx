import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const YouTubeSection = () => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="mb-4 text-xl font-bold text-blue-700">İlgili Videolar</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/MB26JRTbdKE"
              title="YouTube video 1"
              allowFullScreen
              className="w-full h-72 md:h-96"
            ></iframe>
          </div>
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/hc-yBuo057E"
              title="YouTube video 2"
              allowFullScreen
              className="w-full h-72 md:h-96"
            ></iframe>
          </div>
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/MB26JRTbdKE"
              title="YouTube video 1"
              allowFullScreen
              className="w-full h-72 md:h-96"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSection;