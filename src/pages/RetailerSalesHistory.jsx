import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

function RetailerSalesHistory() {
  // --- STOCK DATA ---
  const [sales] = useState([
    { id: 'ORD-7782', customer: 'Alice Johnson', date: 'Nov 20, 2025', total: 14.50, items: 'Apples, Milk' },
    { id: 'ORD-7783', customer: 'Bob Smith', date: 'Nov 19, 2025', total: 22.00, items: 'Eggs, Bread, Cheese' },
    { id: 'ORD-7784', customer: 'Charlie Brown', date: 'Nov 18, 2025', total: 5.99, items: 'Milk' },
  ]);

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Sales History</h1>
        <p className="lead fs-4">Track customer purchases.</p>
      </Container>

      <Container className="my-5">
        <Stack gap={3}>
          {sales.map((sale) => (
            <Card key={sale.id} className="shadow-sm border-0">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={3}>
                    <h5 className="mb-0 fw-bold">{sale.id}</h5>
                    <small className="text-muted">{sale.date}</small>
                  </Col>
                  <Col md={3}>
                    <div className="fw-bold">Customer</div>
                    <div>{sale.customer}</div>
                  </Col>
                  <Col md={4}>
                    <div className="fw-bold">Items Sold</div>
                    <div className="text-muted text-truncate">{sale.items}</div>
                  </Col>
                  <Col md={2} className="text-end">
                     <h4 className="text-success fw-bold mb-0">${sale.total.toFixed(2)}</h4>
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

export default RetailerSalesHistory;