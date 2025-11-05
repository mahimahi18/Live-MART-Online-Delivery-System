import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';

// Placeholder for past orders
const dummyOrders = [
  { id: "ORD-123", date: "2025-10-28", total: 104.98, status: "Delivered" },
  { id: "ORD-124", date: "2025-11-01", total: 39.99, status: "Processing" },
  { id: "ORD-125", date: "2025-11-04", total: 79.99, status: "Shipped" },
];

function CustomerDashboard() {
  return (
    <Container className="my-4">
      <Row>
        {/* Sidebar / Navigation Column */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Dashboard</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action active> {/* 'active' highlights this item */}
                Order History
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/profile">
                My Profile
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/cart">
                My Cart
              </ListGroup.Item>
              <ListGroup.Item action>
                Addresses (Coming Soon)
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Main Content Column */}
        <Col md={9}>
          <h2>Welcome, Customer!</h2>
          <p>This is your personal dashboard. You can view your past orders and manage your account.</p>
          
          <hr className="my-4" />

          <h4>Recent Order History</h4>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-none d-md-block">
                <Row className="fw-bold">
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
                    <Col xs={12} md>${order.total.toFixed(2)}</Col>
                    
                    <Col xs={12} md="auto" className="d-md-none mt-2"><strong >Status:</strong></Col>
                    <Col xs={12} md>{order.status}</Col>
                    
                    <Col xs={12} md className="mt-2 mt-md-0">
                      <Button variant="outline-primary" size="sm">
                        View Details
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CustomerDashboard;