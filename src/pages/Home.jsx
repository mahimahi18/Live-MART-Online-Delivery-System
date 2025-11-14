// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <Container fluid className="p-5 mb-4 bg-light rounded-3 text-center">
        <h1 className="display-4">🏠 Welcome to LiveMart!</h1>
        <p className="lead">
          Your one-stop shop for fresh products, delivered fast.
        </p>
        <Button as="a" href="/products" variant="primary" size="lg">
          Shop All Products
        </Button>
      </Container>

      {/* 2. Featured Products Section */}
      <Container>
        <h2>Featured Products</h2>
        <Row className="gy-4"> {/* gy-4 adds vertical gutter spacing */}
          
          {/* Sample Product Card 1 */}
          <Col md={4}>
            <Card>
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Placeholder Product" />
              <Card.Body>
                <Card.Title>Sample Product 1</Card.Title>
                <Card.Text>
                  A short description of the product.
                </Card.Text>
                <Button variant="success">Add to Cart</Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Sample Product Card 2 */}
          <Col md={4}>
            <Card>
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Placeholder Product" />
              <Card.Body>
                <Card.Title>Sample Product 2</Card.Title>
                <Card.Text>
                  A short description of the product.
                </Card.Text>
                <Button variant="success">Add to Cart</Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Sample Product Card 3 */}
          <Col md={4}>
            <Card>
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Placeholder Product" />
              <Card.Body>
                <Card.Title>Sample Product 3</Card.Title>
                <Card.Text>
                  A short description of the product.
                </Card.Text>
                <Button variant="success">Add to Cart</Button>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </>
  );
}