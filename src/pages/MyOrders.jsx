import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Import the pre-initialized auth
import { getMyOrders } from '../services/orderService'; 
// We won't use MyOrders.css, we'll use Bootstrap components
// import './MyOrders.css'; 

// --- NEW: Import React-Bootstrap Components ---
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Stack from 'react-bootstrap/Stack';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // To redirect

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for redirecting

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Fetching orders for user:", user.uid);
        getMyOrders(user.uid)
          .then(data => {
            setOrders(data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching orders:", error);
            setLoading(false);
          });
      } else {
        // No user, redirect to login
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]); // Add navigate to dependency array

  // --- THEMED RENDER ---

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="success" role="status" />
        <h1 className="mt-3">Loading your orders...</h1>
      </Container>
    );
  }

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
        <h1 className="display-3 fw-bold">My Orders</h1>
        <p className="lead fs-4">
          Track your order history.
        </p>
      </Container>

      {/* 2. Orders Content */}
      <Container className="my-5">
        {orders.length === 0 ? (
          // --- Themed "No Orders" state ---
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <Card.Title as="h1">You have no orders.</Card.Title>
                  <Card.Text>
                    All your future orders will show up here.
                  </Card.Text>
                  <Button variant="primary" onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          // --- Themed Order List ---
          <Stack gap={4}>
            {orders.map(order => (
              <Card key={order.id} className="shadow-sm border-0">
                <Card.Header className="bg-light p-3">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <h5 className="mb-0">Order ID: {order.id}</h5>
                    </Col>
                    <Col md={6} className="text-md-end">
                      <span>Status: <strong className="text-success">{order.status}</strong></span>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    <Col md={8}>
                      <h5 className="fw-bold">Products</h5>
                      <ListGroup variant="flush">
                        {order.products.map((product, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between">
                            <span>{product.name}</span>
                            <span className="text-muted">Quantity: {product.quantity}</span>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Col>
                    <Col md={4} className="mt-3 mt-md-0">
                      <h5 className="fw-bold">Summary</h5>
                      <Stack gap={2}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Total:</span>
                          <h5 className="fw-bold text-success mb-0">${order.totalAmount.toFixed(2)}</h5>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Address:</span>
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </Stack>
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

export default MyOrders;