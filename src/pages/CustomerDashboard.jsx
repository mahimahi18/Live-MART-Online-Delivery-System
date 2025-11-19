import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';

// Placeholder for past orders
const dummyOrders = [
  { id: "ORD-123", date: "2025-10-28", total: 104.98, status: "Delivered" },
  { id: "ORD-124", date: "2025-11-01", total: 39.99, status: "Processing" },
  { id: "ORD-125", date: "2025-11-04", total: 79.99, status: "Shipped" },
];

function CustomerDashboard() {
  return (
    <>
      {/* 1. "Mini-Hero" Section for Theme Consistency */}
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{ 
          background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' 
        }}
      >
        <h1 className="display-3 fw-bold">Customer Dashboard</h1>
        <p className="lead fs-4">
          Welcome! Manage your account and orders.
        </p>
      </Container>

      {/* 2. Dashboard Content */}
      <Container className="my-4">
        <Row>
          {/* Sidebar / Navigation Column */}
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Header as="h5" className="bg-light fw-bold">Dashboard</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item action as={Link} to="/my-orders"> {/* Point to real orders page */}
                  Order History
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/profile">
                  My Profile
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/cart">
                  My Cart
                </ListGroup.Item>
                <ListGroup.Item action disabled>
                  Addresses (Coming Soon)
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          {/* Main Content Column */}
          <Col md={9} className="mt-4 mt-md-0">
            <Stack gap={4}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h2 className="fw-bold">Welcome, Customer!</h2>
                  <p>This is your personal dashboard. You can view your recent orders below or manage your account using the links to the left.</p>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light p-3">
                  <h4 className="mb-0 fw-bold">Recent Order History</h4>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-none d-md-block">
                    <Row className="fw-bold text-muted">
                      <Col>Order ID</Col>
                      <Col>Date</Col>
                      <Col>Total</Col>
                      <Col>Status</Col>
                      <Col></Col>
                    </Row>
                  </ListGroup.Item>

                  {dummyOrders.map(order => (
                    <ListGroup.Item key={order.id}>
                      <Row className="align-items-center">
                        <Col xs={12} md="auto" className="d-md-none"><strong >Order ID:</strong></Col>
                        <Col xs={12} md>{order.id}</Col>
                        
                        <Col xs={12} md="auto" className="d-md-none mt-2"><strong >Date:</strong></Col>
                        <Col xs={12} md>{order.date}</Col>
                        
                        <Col xs={12} md="auto" className="d-md-none mt-2"><strong >Total:</strong></Col>
                        <Col xs={12} md><span className="fw-bold text-success">${order.total.toFixed(2)}</span></Col>
                        
                        <Col xs={12} md="auto" className="d-md-none mt-2"><strong >Status:</strong></Col>
                        <Col xs={12} md><span className="fw-bold">{order.status}</span></Col>
                        
                        <Col xs={12} md className="mt-2 mt-md-0 text-md-end">
                          <Button as={Link} to="/my-orders" variant="outline-primary" size="sm">
                            View Details
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Card.Footer className="text-center">
                  <Button as={Link} to="/my-orders" variant="primary">
                    View All Orders
                  </Button>
                </Card.Footer>
              </Card>
            </Stack>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CustomerDashboard;