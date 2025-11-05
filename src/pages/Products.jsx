import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

// This is a placeholder for your clothing products.
// Later, you will fetch this data from your Firebase/Firestore database.
const dummyProducts = [
  {
    id: 1,
    name: "Men's Cotton T-Shirt",
    description: "A classic crew-neck t-shirt made of 100% cotton.",
    price: 25.00,
    image: "https://via.placeholder.com/300x200?text=Men's+T-Shirt"
  },
  {
    id: 2,
    name: "Women's Denim Jeans",
    description: "Stylish and comfortable slim-fit denim jeans.",
    price: 49.99,
    image: "https://via.placeholder.com/300x200?text=Women's+Jeans"
  },
  {
    id: 3,
    name: "Unisex Hoodie",
    description: "A warm and cozy fleece-lined pullover hoodie.",
    price: 39.99,
    image: "https://via.placeholder.com/300x200?text=Hoodie"
  },
  {
    id: 4,
    name: "Leather Jacket",
    description: "Classic biker-style jacket made from real leather.",
    price: 149.99,
    image: "https://via.placeholder.com/300x200?text=Leather+Jacket"
  },
  {
    id: 5,
    name: "Running Shoes",
    description: "Lightweight and breathable sneakers for your workout.",
    price: 79.99,
    image: "https://via.placeholder.com/300x200?text=Running+Shoes"
  },
  {
    id: 6,
    name: "Summer Dress",
    description: "A light, floral-print sundress perfect for warm weather.",
    price: 45.00,
    image: "https://via.placeholder.com/300x200?text=Summer+Dress"
  },
  {
    id: 7,
    name: "Beanie Hat",
    description: "A soft, warm knit beanie for cold days.",
    price: 15.99,
    image: "https://via.placeholder.com/300x200?text=Beanie"
  },
  {
    id: 8,
    name: "Canvas Backpack",
    description: "Durable canvas backpack with multiple compartments.",
    price: 55.00,
    image: "https://via.placeholder.com/300x200?text=Backpack"
  }
];

export default function Products() {
  return (
    <Container>
      <h1 className="my-4">👕 Browse Our Products</h1>

      {/* This <Row> creates a responsive grid:
        - xs={1}: 1 column on extra-small screens (mobile)
        - md={2}: 2 columns on medium screens (tablet)
        - lg={4}: 4 columns on large screens (desktop)
        - className="g-4": Adds spacing (gutter) between items.
      */}
      <Row xs={1} md={2} lg={4} className="g-4">
        {dummyProducts.map(product => (
          <Col key={product.id}>
            <Card className="h-100"> {/* h-100 makes all cards the same height */}
              <Card.Img variant="top" src={product.image} />
              <Card.Body className="d-flex flex-column"> {/* Flex column for footer */}
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  {product.description}
                </Card.Text>
                
                {/* This pushes the price and button to the bottom */}
                <div className="mt-auto"> 
                  <h5 className="mb-2">${product.price.toFixed(2)}</h5>
                  <Button variant="primary" className="w-100">
                    Add to Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}