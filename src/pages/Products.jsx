import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { getAllProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import './Products.css'; // Optional custom CSS for grid and responsiveness

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching all products...");
        const data = await getAllProducts();
        setProducts(data);
        console.log("Products loaded:", data);
      } catch (error) {
        console.error("Error fetching products:", error);
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
    <Container className="my-5 products-container">
      <h1 className="text-center mb-4">🛍️ Our Products</h1>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map((product) => (
          <Col key={product.id}>
            <Card className="product-card shadow-sm h-100">
              <Card.Img
                variant="top"
                src={product.imageURL || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="product-image"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  {product.description || 'No description available.'}
                </Card.Text>
                <h5 className="mb-3">${product.price.toFixed(2)}</h5>
                <p className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </p>
                <Button
                  variant={product.stock > 0 ? 'primary' : 'secondary'}
                  className="w-100 mt-auto"
                  onClick={() => {
                    addToCart(product);
                    alert(`${product.name} added to cart!`);
                  }}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

