import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';

function CustomerDashboard() {
  return (
    <>
      {/* 1. "Mini-Hero" Section */}
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
                <ListGroup.Item action as={Link} to="/my-orders">
                  Order History
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/profile">
                  My Profile
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/cart">
                  My Cart
                </ListGroup.Item>
                {/* "Addresses" removed here */}
              </ListGroup>
            </Card>
          </Col>

          {/* Main Content Column */}
          <Col md={9} className="mt-4 mt-md-0">
            <Stack gap={4}>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h2 className="fw-bold">Welcome, Customer!</h2>
                  <p className="mb-4">
                    This is your personal dashboard. You can manage your account using the links to the left.
                  </p>
                  
                  {/* Added a main button here since the table is gone */}
                  <Button as={Link} to="/my-orders" variant="primary" size="lg">
                    View Order History
                  </Button>
                </Card.Body>
              </Card>
              
              {/* "Recent Order History" Card removed here */}
            </Stack>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CustomerDashboard;