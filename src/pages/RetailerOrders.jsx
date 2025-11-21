import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

function RetailerOrders() {
  // --- STOCK DATA ---
  const [orders] = useState([
    { id: 'W-ORD-001', date: 'Nov 25, 2025', item: 'Bulk Apples (Crate)', qty: 2, status: 'Shipped', total: 90.00 },
    { id: 'W-ORD-002', date: 'Nov 28, 2025', item: 'Milk Pallet', qty: 1, status: 'Processing', total: 200.00 },
    { id: 'W-ORD-003', date: 'Nov 10, 2025', item: 'Rice Bags', qty: 5, status: 'Delivered', total: 275.00 },
  ]);

  const getStatusBadge = (status) => {
    if (status === 'Delivered') return <Badge bg="success">Delivered</Badge>;
    if (status === 'Shipped') return <Badge bg="info">Shipped</Badge>;
    return <Badge bg="warning" text="dark">Processing</Badge>;
  };

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">My Wholesale Orders</h1>
        <p className="lead fs-4">Track your incoming stock shipments.</p>
      </Container>

      <Container className="my-5">
        <Stack gap={3}>
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm border-0">
               <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-muted">{order.id}</span>
                  {getStatusBadge(order.status)}
               </Card.Header>
               <Card.Body>
                 <Row className="align-items-center">
                    <Col md={6}>
                        <h5 className="mb-1">{order.item}</h5>
                        <p className="text-muted mb-0">Quantity: {order.qty} • Ordered on: {order.date}</p>
                    </Col>
                    <Col md={6} className="text-end">
                        <h3 className="text-success mb-0">${order.total.toFixed(2)}</h3>
                    </Col>
                 </Row>
               </Card.Body>
            </Card>
          ))}
        </Stack>
      </Container>
    </>
  );
}

export default RetailerOrders;