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

import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- CONFIGURATION: STOCK DATE ---
  const HARDCODED_DISPLAY_DATE = "November 28, 2025";
  const HARDCODED_CALENDAR_DATE = "20251128"; // YYYYMMDD

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));

        const unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setOrders(ordersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
          }
        );

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // --- CALENDAR FUNCTIONALITY ---
  const downloadCalendarEvent = (order) => {
    const dateStr = HARDCODED_CALENDAR_DATE;

    const productList = order.products
      ? order.products.map((p) => p.name).join(", ")
      : "Order details";

    const description = `Order ID: ${order.id}\nItems: ${productList}`;
    const location = order.deliveryAddress || "Online Order";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:LiveMart Delivery - Order #${order.id.slice(0, 6)}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `livemart-order-${order.id}.ics`);

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
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{
          background:
            "linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)",
        }}
      >
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
                  <Card.Text>
                    All your future orders will show up here.
                  </Card.Text>
                  <Button variant="primary" onClick={() => navigate("/products")}>
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Stack gap={4}>
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm border-0">
                <Card.Header className="bg-light p-3">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <h5 className="mb-0">Order ID: {order.id}</h5>
                    </Col>
                    <Col md={6} className="text-md-end">
                      <span>
                        Status:{" "}
                        <strong className="text-success">{order.status}</strong>
                      </span>
                    </Col>
                  </Row>
                </Card.Header>

                <Card.Body className="p-4">
                  <Row>
                    {/* PRODUCTS */}
                    <Col md={8}>
                      <h5 className="fw-bold">Products</h5>
                      <ListGroup variant="flush">
                        {order.products &&
                          order.products.map((product, index) => (
                            <ListGroup.Item
                              key={index}
                              className="d-flex justify-content-between"
                            >
                              <span>{product.name}</span>
                              <span className="text-muted">
                                Quantity: {product.quantity}
                              </span>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </Col>

                    {/* SUMMARY */}
                    <Col md={4} className="mt-3 mt-md-0">
                      <h5 className="fw-bold">Summary</h5>
                      <Stack gap={2}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Date:</span>
                          <span>{HARDCODED_DISPLAY_DATE}</span>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Total:</span>
                          <h5 className="fw-bold text-success mb-0">
                            ${Number(order.totalAmount || 0).toFixed(2)}
                          </h5>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Address:</span>
                          <span>{order.deliveryAddress || "N/A"}</span>
                        </div>

                        <hr />

                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="calendar-btn"
                          onClick={() => downloadCalendarEvent(order)}
                        >
                          <span className="me-2">📅</span>
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
