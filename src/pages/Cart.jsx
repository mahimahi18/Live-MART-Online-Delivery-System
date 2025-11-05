import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';

// This is a placeholder. 
// In your real app, this data would come from context, Redux, or local storage.
const dummyCartItems = [
  {
    id: 1,
    name: "Men's Cotton T-Shirt",
    price: 25.00,
    quantity: 2,
    image: "https://via.placeholder.com/100x100?text=T-Shirt"
  },
  {
    id: 5,
    name: "Running Shoes",
    price: 79.99,
    quantity: 1,
    image: "https://via.placeholder.com/100x100?text=Shoes"
  }
];


function Cart() {
  // --- STATE ---
  // We'll use this state to switch between the empty and filled cart views.
  // To test, you can change '[]' to 'dummyCartItems' to see the filled cart.
  const [cartItems, setCartItems] = useState([]); 
  // const [cartItems, setCartItems] = useState(dummyCartItems); // <-- Use this line to test the "filled" view


  // --- CALCULATIONS ---
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxPrice = itemsPrice * 0.15; // 15% tax
  const shippingPrice = itemsPrice > 200 ? 0 : 20; // Free shipping over $200
  const totalPrice = itemsPrice + taxPrice + shippingPrice;


  // --- RENDER ---
  return (
    <Container className="my-4">
      <h1 className="mb-4">🛒 Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        // --- EMPTY CART VIEW ---
        <div className="text-center p-5 bg-light rounded">
          <h2>Your Cart is Empty!</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Button as={Link} to="/products" variant="primary">
            Start Shopping
          </Button>
        </div>
      ) : (
        // --- FILLED CART VIEW ---
        <Row>
          {/* Column 1: Cart Items List */}
          <Col md={8}>
            <ListGroup variant="flush">
              {cartItems.map(item => (
                <ListGroup.Item key={item.id} className="py-3">
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/products/${item.id}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>
                      ${item.price.toFixed(2)}
                    </Col>
                    <Col md={3}>
                      {/* Here you would add buttons to change quantity */}
                      Quantity: {item.quantity}
                    </Col>
                    <Col md={2}>
                      <Button variant="light" size="sm">Remove</Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* Column 2: Order Summary */}
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Items</span>
                    <strong>${itemsPrice.toFixed(2)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Tax</span>
                    <strong>${taxPrice.toFixed(2)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Shipping</span>
                    <strong>${shippingPrice.toFixed(2)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <h4>Total</h4>
                    <h4>${totalPrice.toFixed(2)}</h4>
                  </ListGroup.Item>
                  {/* <-- FIXED: Removed extra ListGroup.Item tag */}
                </ListGroup>
                <div className="d-grid mt-3">
                  <Button variant="primary" size="lg">
                    Proceed to Checkout
                  </Button> {/* <-- FIXED: Was </Click> */}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Cart;