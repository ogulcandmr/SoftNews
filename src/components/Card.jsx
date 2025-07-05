import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Row, Col, Container } from 'react-bootstrap';
import { motion } from 'framer-motion';

const newsData = [
  {
    id: 1,
    title: 'Haber 1',
    text: 'Bu birinci haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=1',
  },
  {
    id: 2,
    title: 'Haber 2',
    text: 'Bu ikinci haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=2',
  },
  {
    id: 3,
    title: 'Haber 3',
    text: 'Bu üçüncü haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=3',
  },
  {
    id: 1,
    title: 'Haber 4',
    text: 'Bu dördüncü haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=4',
  },{
    id: 1,
    title: 'Haber 5',
    text: 'Bu beşinci haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=5',
  },{
    id: 1,
    title: 'Haber 6',
    text: 'Bu altıncı haberin kısa açıklamasıdır.',
    image: 'https://picsum.photos/286/180?random=6',
  },
];

const NewsList = () => {
  return (
    <Container className="my-4">
      <Row className="g-4">
        {newsData.map((news) => (
          <Col key={news.id} sm={12} md={6} lg={4}>
            
            <Card>
              <Card.Img variant="top" src={news.image} />
              <Card.Body>
                <Card.Title>{news.title}</Card.Title>
                <Card.Text>{news.text}</Card.Text>
                <Button variant="primary">Devamını Oku</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default NewsList;
