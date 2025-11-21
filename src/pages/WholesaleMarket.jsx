import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

function WholesaleMarket() {
  // --- STOCK DATA ---
  const [products] = useState([
    { id: 1, name: 'Bulk Apples (Crate)', wholesaler: 'GreenFarms Ltd.', price: 45.00, unit: '20kg Crate' },
    { id: 2, name: 'Milk Pallet (50 Gallons)', wholesaler: 'DairyBest Co.', price: 200.00, unit: 'Pallet' },
    { id: 3, name: 'Sacks of Potatoes', wholesaler: 'Root Veggies Inc.', price: 30.00, unit: '50kg Sack' },
    { id: 4, name: 'Rice Bags (Bulk)', wholesaler: 'Grain Masters', price: 55.00, unit: '25kg Bag' },
  ]);

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Wholesale Market</h1>
        <p className="lead fs-4">Purchase stock in bulk for your store.</p>
      </Container>

      <Container className="my-5">
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={6} lg={3} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <div className="bg-light p-5 text-center text-muted display-4">📦</div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">By {product.wholesaler}</Card.Subtitle>
                  <div className="mt-auto pt-3">
                    <h4 className="text-success">${product.price} <span className="fs-6 text-muted">/ {product.unit}</span></h4>
                    <Button variant="primary" className="w-100 mt-2">Order Stock</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default WholesaleMarket;