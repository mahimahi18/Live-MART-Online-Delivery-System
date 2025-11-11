import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { getAllProducts } from '../services/ProductService';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <h2>Loading products...</h2>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4 text-center">🛍️ Browse Our Products</h1>
      <Row xs={1} md={2} lg={4} className="g-4">
        {products.map((product) => (
          <Col key={product.id}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={product.imageURL || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="flex-grow-1">
                  {product.description || 'No description available.'}
                </Card.Text>

                <div className="mt-auto">
                  <h5 className="mb-3">${product.price.toFixed(2)}</h5>
                  <Button
                    variant={product.stock > 0 ? 'primary' : 'secondary'}
                    className="w-100"
                    onClick={() => {
                      addToCart(product);
                      alert(`${product.name} added to cart!`);
                    }}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
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
