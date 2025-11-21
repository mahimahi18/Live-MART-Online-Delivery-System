import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

function WholesalerIncomingOrders() {
  // --- STOCK DATA ---
  const [orders] = useState([
    { id: 'ORD-901', retailer: 'City Supermarket', items: '10x Apple Crates', total: 450.00, status: 'Pending' },
    { id: 'ORD-902', retailer: 'Corner Store', items: '2x Rice Bags', total: 110.00, status: 'Pending' },
  ]);

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Incoming Orders</h1>
        <p className="lead fs-4">Process orders from retailers.</p>
      </Container>

      <Container className="my-5">
        {orders.length === 0 ? (
            <div className="text-center">No pending orders.</div>
        ) : (
            <Stack gap={3}>
                {orders.map((order) => (
                    <Card key={order.id} className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                <Col md={3}>
                                    <h5 className="fw-bold">{order.retailer}</h5>
                                    <small className="text-muted">Order #{order.id}</small>
                                </Col>
                                <Col md={4}>
                                    <span className="fw-bold text-dark">{order.items}</span>
                                </Col>
                                <Col md={2}>
                                    <h4 className="text-success mb-0">${order.total}</h4>
                                </Col>
                                <Col md={3} className="text-end">
                                    <Button variant="outline-danger" className="me-2">Reject</Button>
                                    <Button variant="success">Approve & Ship</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </Stack>
        )}
      </Container>
    </>
  );
}

export default WholesalerIncomingOrders;