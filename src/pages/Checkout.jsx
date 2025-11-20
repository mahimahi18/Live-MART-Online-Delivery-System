import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch } from 'firebase/firestore';
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

  // Calculate Total - SAFELY (Handles if price is a string or number)
  const total = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  // 2. THE PLACE ORDER FUNCTION
  const handlePlaceOrder = async (e) => {
    e.preventDefault(); 

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setProcessing(true); 

    // Simulate network delay
    setTimeout(async () => {
      try {
        const user = auth.currentUser;
        
        // --- SANITIZE DATA ---
        // Ensure all numbers are actually numbers so database doesn't reject them
        const cleanProducts = cartItems.map(item => ({
          name: item.name || "Unknown Product",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }));

        const orderData = {
          userId: user.uid,
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          totalAmount: Number(total), // Ensure this is a Number
          // I REMOVED "status" HERE - It is often the cause of permission errors
          deliveryAddress: `${address}, ${city}, ${zip}`,
          products: cleanProducts // Send the clean list
        };

        // A. Create the Order
        await addDoc(collection(db, "orders"), orderData);

        // B. Clear the User's Cart
        const batch = writeBatch(db);
        cartItems.forEach((item) => {
          const itemRef = doc(db, "users", user.uid, "cart", item.id);
          batch.delete(itemRef);
        });
        await batch.commit();

        // C. Success!
        console.log("Order placed successfully!");
        navigate('/my-orders'); 

      } catch (error) {
        console.error("Error placing order:", error);
        // IMPORTANT: This logs the REAL error to your Console (F12)
        alert(`Failed to place order: ${error.message}`);
      } finally {
        setProcessing(false);
      }
    }, 2000); 
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
                    // Safety check for display as well
                    const displayPrice = Number(item.price) || 0;
                    const displayQty = Number(item.quantity) || 1;
                    return (
                      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{item.name}</div>
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