// Home.js

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

// Import Icons (Removed Star icons as they are no longer needed)
import { 
  Truck, 
  Leaf, 
  ShieldCheck 
} from 'react-bootstrap-icons';

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{ 
          background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' 
        }}
      >
        {/* Symbol removed below */}
        <h1 className="display-3 fw-bold">Welcome to LiveMart!</h1>
        <p className="lead fs-4">
          Your one-stop shop for products so fresh, they're practically live.
        </p>
        <Button as="a" href="/products" variant="light" size="lg">
          Shop All Products
        </Button>
      </Container>

      {/* 2. "Why Choose Us" Features Section */}
      <Container className="my-5 text-center">
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

      {/* (Featured Products Section Removed) */}

      {/* (Testimonial Section Removed) */}

      {/* 3. Final Call to Action (CTA) Section */}
      <Container className="my-5">
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