// Home.js

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

// 1. IMPORT ICONS!
import { 
  Truck, 
  Leaf, 
  ShieldCheck, 
  StarFill, 
  StarHalf, 
  Star
} from 'react-bootstrap-icons';

// --- NEW IMPORTS ---
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- FIX: Correcting the firebase import path. Assuming firebase.js is in src.
import { auth, db } from '../firebase'; // Changed from './firebase'
import { doc, runTransaction } from 'firebase/firestore'; // Import firestore functions
// --------------------

// 2. Your Home component
export default function Home() {
  
  // --- NEW STATE AND FUNCTIONS ---
  const [adding, setAdding] = useState(null); // Tracks which product is being added
  const navigate = useNavigate();

  // Define product data
  const featuredProducts = [
    { 
      id: 'prod1', 
      name: 'Organic Fruit Basket', 
      price: 24.99, 
      image: 'https://source.unsplash.com/random/600x400/?fruit',
      rating: 4.5,
      stars: <><StarFill /> <StarFill /> <StarFill /> <StarFill /> <StarHalf /></>
    },
    { 
      id: 'prod2', 
      name: 'Local Veggie Box', 
      price: 19.99, 
      image: 'https://source.unsplash.com/random/600x400/?vegetables',
      rating: 5,
      stars: <><StarFill /> <StarFill /> <StarFill /> <StarFill /> <StarFill /></>
    },
    { 
      id: 'prod3', 
      name: 'Artisan Sourdough', 
      price: 5.99, 
      image: 'https://source.unsplash.com/random/600x400/?bread',
      rating: 4,
      stars: <><StarFill /> <StarFill /> <StarFill /> <StarFill /> <Star /></>
    }
  ];

  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      // If no user, redirect to login
      navigate('/login');
      setAdding(null); // Reset button
      return;
    }

    // Use product.id as the document ID in the cart for easy checking/updating
    // FIX: Using correct path for user's cart
    const cartItemRef = doc(db, "users", user.uid, "cart", product.id);

    try {
      // Use a transaction to safely read and write
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartItemRef);
        
        if (cartDoc.exists()) {
          // If item exists, increment quantity
          const newQuantity = cartDoc.data().quantity + 1;
          transaction.update(cartItemRef, { quantity: newQuantity });
        } else {
          // If item doesn't exist, add it with quantity 1
          // We only store the essential info, not the full product object
          transaction.set(cartItemRef, { 
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1 
          });
        }
      });
      console.log(`${product.name} added to cart!`);
    
    // --- THIS IS THE FIX ---
    // Added the missing { and }
    } catch (error) { 
      console.error("Error adding to cart: ", error);
      // You could show an error toast here
    // -----------------------
    } finally {
      setAdding(null); // Reset button state
    }
  };
  // ------------------------------

  return (
    <>
      {/* 1. Hero Section - "Today's Deals" button removed */}
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{ 
          background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' 
        }}
      >
        <h1 className="display-3 fw-bold">🏠 Welcome to LiveMart!</h1>
        <p className="lead fs-4">
          Your one-stop shop for products so fresh, they're practically live.
        </p>
        <Button as="a" href="/products" variant="light" size="lg">
          Shop All Products
        </Button>
        {/* "Today's Deals" button was here and is now removed. */}
      </Container>

      {/* 2. "Why Choose Us" Features Section (No changes) */}
      <Container className="my-5 text-center">
        {/* ... existing code ... */}
        <Row>
          <Col md={4}>
            <Truck size={48} className="mb-3 text-success" />
            <h4 className="fw-bold">Fastest Delivery</h4>
            <p className="text-muted">Get your order in under 2 hours, guaranteed.</p>
          </Col>
          <Col md={4}>
            <Leaf size={48} className="mb-3 text-success" />
            <h4 className="fw-bold">Farm Fresh</h4>
            <p className="text-muted">Sourced directly from local farms. No compromises.</p>
          </Col>
          <Col md={4}>
            <ShieldCheck size={48} className="mb-3 text-success" />
            <h4 className="fw-bold">Quality Assured</h4>
            <p className="text-muted">Every item is hand-checked for quality before it's packed.</p>
          </Col>
        </Row>
      </Container>

      {/* 3. Featured Products Section - Now dynamic and functional */}
      <Container className="my-5">
        <h2 className="mb-4 text-center fw-bold">Our Featured Products</h2>
        <Row className="g-4">
          
          {/* We now map over the products array to create the cards */}
          {featuredProducts.map((product) => (
            <Col md={6} lg={4} key={product.id}>
              <Card className="shadow border-0 h-100">
                <Card.Img variant="top" src={product.image} alt={product.name} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{product.name}</Card.Title>
                  <Card.Text>
                    A short description of the product.
                  </Card.Text>
                  
                  {/* Price and Rating */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-success fw-bold mb-0">${product.price.toFixed(2)}</h4>
                    <div className="text-warning">
                      {product.stars}
                    </div>
                  </div>

                  {/* UPDATED BUTTON */}
                  <Button 
                    variant="primary" 
                    className="mt-auto w-100"
                    onClick={() => handleAddToCart(product)}
                    disabled={adding === product.id}
                  >
                    {adding === product.id ? 'Adding...' : 'Add to Cart'}
                  </Button>

                </Card.Body>
              </Card>
            </Col>
          ))}

        </Row>
      </Container>

      {/* 4. Testimonial Section (No changes) */}
      <Container fluid className="bg-light p-5 my-5">
        {/* ... existing code ... */}
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <img 
              src="https://source.unsplash.com/random/100x100/?person" 
              alt="Customer" 
              className="rounded-circle mb-3 shadow"
            />
            <blockquote className="blockquote fs-4">
              <p>"LiveMart completely changed how I shop for groceries. The quality is incredible, and the speed is unbeatable. I'm a customer for life!"</p>
            </blockquote>
            <footer className="blockquote-footer">
              Sarah K. in <cite title="Source Title">Green Valley</cite>
            </footer>
          </Col>
        </Row>
      </Container>

      {/* 5. Final Call to Action (CTA) Section (No changes) */}
      <Container className="my-5">
        {/* ... existing code ... */}
        <Row className="p-5 bg-dark text-white rounded-3 shadow-lg align-items-center">
          <Col md={8}>
            <h2 className="display-5 fw-bold">Ready to shop?</h2>
            <p className="lead">
              Get 15% off your first order. Use code <code className="text-warning">LIVEFRESH15</code> at checkout.
            </p>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <Button href="/products" variant="warning" size="lg" className="fw-bold">
              Start Shopping Now!
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}