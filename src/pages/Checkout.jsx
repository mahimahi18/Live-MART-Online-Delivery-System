import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
// UPDATED IMPORTS: Removed addDoc, writeBatch. Added functions imports.
import { collection, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';

// React-Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';

// Icons
import { CreditCard, GeoAlt } from 'react-bootstrap-icons';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); 
  const navigate = useNavigate();

  // Form States
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // 1. Fetch Cart Items
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setCartItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error loading cart:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Calculate Total
  const total = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  // 2. THE NEW "HYBRID" PLACE ORDER FUNCTION
  const handlePlaceOrder = async (e) => {
    e.preventDefault(); 

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setProcessing(true); 

    try {
      // Initialize Firebase Functions
      const functions = getFunctions();
      const placeOrderFn = httpsCallable(functions, 'placeOrder');
      
      // Combine address fields - FIXED SYNTAX HERE
      const fullAddress = `${address}, ${city}, ${zip}`;

      // CALL THE BACKEND
      const result = await placeOrderFn({ 
        deliveryAddress: fullAddress,
        paymentMode: "Credit Card (Mock)" 
      });

      if (result.data.success) {
        console.log("Order placed successfully! ID:", result.data.orderId);
        // FIXED SYNTAX HERE
        alert(`Order Confirmed! Your Order ID is: ${result.data.orderId}`);
        
        // Navigate to Orders page
        navigate('/my-orders'); 
      }

    } catch (error) {
      console.error("Error placing order:", error);
      // FIXED SYNTAX HERE
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      {/* Green Hero Header */}
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Checkout</h1>
        <p className="lead">Complete your purchase securely.</p>
      </Container>

      <Container className="mb-5">
        <Row>
          {/* LEFT COLUMN: FORMS */}
          <Col md={8}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white fw-bold"><GeoAlt className="me-2"/>Shipping Address</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} required />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control type="text" placeholder="New York" value={city} onChange={e => setCity(e.target.value)} required />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Zip Code</Form.Label>
                        <Form.Control type="text" placeholder="10001" value={zip} onChange={e => setZip(e.target.value)} required />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white fw-bold"><CreditCard className="me-2"/>Payment Details (Mock)</Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <small>This is a demo. Do not enter real credit card info. Enter "4242..." for testing.</small>
                </Alert>
                <Form onSubmit={handlePlaceOrder}>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry</Form.Label>
                        <Form.Control type="text" placeholder="MM/YY" required />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>CVC</Form.Label>
                        <Form.Control type="text" placeholder="123" required />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN: SUMMARY */}
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light fw-bold">Order Summary</Card.Header>
              <ListGroup variant="flush">
                {cartItems.map(item => {
                    const displayPrice = Number(item.price) || 0;
                    const displayQty = Number(item.quantity) || 1;
                    return (
                      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{item.name || item.title}</div>
                          <small className="text-muted">Qty: {displayQty}</small>
                        </div>
                        <span>${(displayPrice * displayQty).toFixed(2)}</span>
                      </ListGroup.Item>
                    );
                })}
                <ListGroup.Item className="fw-bold d-flex justify-content-between">
                  <span>Total</span>
                  <span className="text-success">${total.toFixed(2)}</span>
                </ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <Button 
                  variant="success" 
                  size="lg" 
                  className="w-100" 
                  onClick={handlePlaceOrder}
                  disabled={processing || cartItems.length === 0}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}