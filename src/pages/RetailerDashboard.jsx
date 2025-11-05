import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'; // We'll use a Table for products

// Placeholder for the retailer's products
const dummyMyProducts = [
  { id: 1, name: "Men's Cotton T-Shirt", price: 25.00, stock: 150 },
  { id: 2, name: "Women's Denim Jeans", price: 49.99, stock: 100 },
  { id: 5, name: "Running Shoes", price: 79.99, stock: 50 },
];

// Placeholder for incoming orders
const dummyOrders = [
  { id: "ORD-124", date: "2025-11-01", total: 39.99, status: "Processing" },
  { id: "ORD-125", date: "2025-11-04", total: 79.99, status: "Processing" },
];


function RetailerDashboard() {
  return (
    <Container className="my-4">
      <Row>
        {/* Sidebar / Navigation Column */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Retailer Menu</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action active> {/* 'active' highlights this item */}
                Manage Products
              </ListGroup.Item>
              <ListGroup.Item action>
                View Orders (Coming Soon)
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/profile">
                Account Settings
              </ListGroup.Item>
              <ListGroup.Item action>
                Analytics (Coming Soon)
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Main Content Column */}
        <Col md={9}>
          <h2>Welcome, Retailer!</h2>
          <p>Manage your products, view your orders, and grow your business.</p>
          
          <hr className="my-4" />

          {/* Section 1: Manage Products */}
          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Your Products</h4>
              <Button variant="primary">
                + Add New Product
              </Button>
            </div>
            <Card>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyMyProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <Button variant="outline-secondary" size="sm" className="me-2">Edit</Button>
                        <Button variant="outline-danger" size="sm">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

          {/* Section 2: Incoming Orders */}
          <section className="mt-5">
            <h4>Recent Incoming Orders</h4>
            <Card>
              <ListGroup variant="flush">
                {dummyOrders.map(order => (
                  <ListGroup.Item key={order.id}>
                    <Row>
                      <Col>{order.id}</Col>
                      <Col md="auto">{order.date}</Col>
                      <Col md="auto">${order.total.toFixed(2)}</Col>
                      <Col md="auto">
                        <Button variant="outline-primary" size="sm">
                          View Order
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </section>

        </Col>
      </Row>
    </Container>
  );
}

export default RetailerDashboard;