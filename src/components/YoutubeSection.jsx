import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const YouTubeSection = () => {
  return (
    <Container style={{ maxWidth: '800px', marginTop: '40px' }}>
      <h3 className="mb-4">İlgili Videolar</h3>
      <Row>
        <Col md={6} className="mb-4">
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/MB26JRTbdKE"
              title="YouTube video 1"
              allowFullScreen
            ></iframe>
          </div>
        </Col>
        <Col md={6} className="mb-4">
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/hc-yBuo057E"
              title="YouTube video 2"
              allowFullScreen
            ></iframe>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default YouTubeSection;