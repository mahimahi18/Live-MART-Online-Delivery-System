import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom'; 

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Stack from 'react-bootstrap/Stack';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';

// Import CSS for the calendar link styling
import './MyOrders.css';

// Removed 'react-bootstrap-icons' to prevent build errors
// import { CalendarEvent } from 'react-bootstrap-icons';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid)); 

        // Real-time listener
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort by date (newest first)
          ordersData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setOrders(ordersData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // --- CALENDAR FUNCTIONALITY ---
  const downloadCalendarEvent = (order) => {
    // Create simple ICS content
    const dateStr = order.date.replace(/-/g, ''); // YYYYMMDD
    const description = `Order ID: ${order.id}\\nItems: ${order.products.map(p => p.name).join(', ')}`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:LiveMart Delivery - Order #${order.id.slice(0, 6)}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${order.deliveryAddress}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `livemart-order-${order.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">My Orders</h1>
        <p className="lead fs-4">Track your order history.</p>
      </Container>

      <Container className="my-5">
        {orders.length === 0 ? (
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <Card.Title as="h1">You have no orders.</Card.Title>
                  <Card.Text>All your future orders will show up here.</Card.Text>
                  <Button variant="primary" onClick={() => navigate('/products')}>Start Shopping</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Stack gap={4}>
            {orders.map(order => (
              <Card key={order.id} className="shadow-sm border-0">
                <Card.Header className="bg-light p-3">
                  <Row className="align-items-center">
                    <Col md={6}><h5 className="mb-0">Order ID: {order.id}</h5></Col>
                    <Col md={6} className="text-md-end"><span>Status: <strong className="text-success">{order.status}</strong></span></Col>
                  </Row>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    <Col md={8}>
                      <h5 className="fw-bold">Products</h5>
                      <ListGroup variant="flush">
                        {order.products && order.products.map((product, index) => (
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
                        <div className="d-flex justify-content-between"><span className="text-muted">Date:</span><span>{order.date}</span></div>
                        <div className="d-flex justify-content-between"><span className="text-muted">Total:</span><h5 className="fw-bold text-success mb-0">${Number(order.totalAmount).toFixed(2)}</h5></div>
                        <div className="d-flex justify-content-between"><span className="text-muted">Address:</span><span>{order.deliveryAddress}</span></div>
                        
                        <hr />
                        {/* CALENDAR LINK */}
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="calendar-btn"
                          onClick={() => downloadCalendarEvent(order)}
                        >
                          <span className="me-2">📅</span> {/* Using Emoji instead of Icon */}
                          Add to Calendar
                        </Button>

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