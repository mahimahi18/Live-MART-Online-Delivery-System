import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
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
import { CreditCard, GeoAlt, Wallet2, QrCode } from 'react-bootstrap-icons';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); 
  const navigate = useNavigate();

  // Form States
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  
  // Payment Mode: 'card', 'upi', 'cod'
  const [paymentMethod, setPaymentMethod] = useState('card'); 
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/login'); return; }

    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setCartItems(items);
      setLoading(false);
    }, (error) => console.error("Error loading cart:", error));

    return () => unsubscribe();
  }, [navigate]);

  const total = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault(); 

    if (cartItems.length === 0) return alert("Your cart is empty!");
    if(!address || !city || !zip) return alert("Please complete the address.");

    setProcessing(true); 

    try {
      const functions = getFunctions();
      const placeOrderFn = httpsCallable(functions, 'placeOrder');
      
      const fullAddress = `${address}, ${city}, ${zip}`;
      
      // Determine Label
      let modeLabel = "Credit Card";
      if (paymentMethod === 'upi') modeLabel = "UPI / QR Code";
      if (paymentMethod === 'cod') modeLabel = "Cash on Delivery";

      const result = await placeOrderFn({ 
        deliveryAddress: fullAddress,
        paymentMode: modeLabel
      });

      if (result.data.success) {
        alert(`Order Confirmed! ID: ${result.data.orderId}`);
        navigate('/my-orders'); 
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Checkout</h1>
      </Container>

      <Container className="mb-5">
        <Row>
          {/* LEFT COLUMN */}
          <Col md={8}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white fw-bold"><GeoAlt className="me-2"/>Shipping Address</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
                  </Form.Group>
                  <Row>
                    <Col><Form.Control type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} /></Col>
                    <Col><Form.Control type="text" placeholder="Zip" value={zip} onChange={e => setZip(e.target.value)} /></Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white fw-bold">Payment Method</Card.Header>
              <Card.Body>
                
                {/* PAYMENT OPTIONS */}
                <div className="d-flex flex-column gap-2 mb-4">
                  {/* Card Option */}
                  <div className={`border rounded p-3 d-flex align-items-center ${paymentMethod === 'card' ? 'bg-light border-success' : ''}`} 
                       onClick={() => setPaymentMethod('card')} style={{cursor: 'pointer'}}>
                    <Form.Check type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="me-3" />
                    <CreditCard className="me-2"/> Credit / Debit Card
                  </div>

                  {/* UPI Option */}
                  <div className={`border rounded p-3 d-flex align-items-center ${paymentMethod === 'upi' ? 'bg-light border-success' : ''}`} 
                       onClick={() => setPaymentMethod('upi')} style={{cursor: 'pointer'}}>
                    <Form.Check type="radio" name="pay" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="me-3" />
                    <QrCode className="me-2"/> UPI (Scan QR)
                  </div>

                  {/* COD Option */}
                  <div className={`border rounded p-3 d-flex align-items-center ${paymentMethod === 'cod' ? 'bg-light border-success' : ''}`} 
                       onClick={() => setPaymentMethod('cod')} style={{cursor: 'pointer'}}>
                    <Form.Check type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="me-3" />
                    <Wallet2 className="me-2"/> Cash on Delivery
                  </div>
                </div>

                {/* CONDITIONAL UI */}
                {paymentMethod === 'card' && (
                  <Form>
                    <Form.Control type="text" placeholder="Card Number" className="mb-2" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                    <Row>
                      <Col><Form.Control type="text" placeholder="MM/YY" /></Col>
                      <Col><Form.Control type="text" placeholder="CVC" /></Col>
                    </Row>
                  </Form>
                )}

                {paymentMethod === 'upi' && (
                  <div className="text-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=UPI-PAY-DEMO" alt="QR" className="img-fluid border p-2 rounded" />
                    <p className="small text-muted mt-2">Scan to Pay</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <Alert variant="warning">Pay cash upon delivery.</Alert>
                )}

              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT COLUMN */}
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light fw-bold">Order Summary</Card.Header>
              <ListGroup variant="flush">
                {cartItems.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="fw-bold d-flex justify-content-between">
                  <span>Total</span>
                  <span className="text-success">${total.toFixed(2)}</span>
                </ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <Button variant="success" size="lg" className="w-100" onClick={handlePlaceOrder} disabled={processing || cartItems.length === 0}>
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