import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { getPendingOrders, updateOrderStatus } from '../services/OrderService';
import './RetailerDashboard.css';

// Placeholder for the retailer's products
const dummyMyProducts = [
  { id: 1, name: "Men's Cotton T-Shirt", price: 25.0, stock: 150 },
  { id: 2, name: "Women's Denim Jeans", price: 49.99, stock: 100 },
  { id: 5, name: "Running Shoes", price: 79.99, stock: 50 },
];

function RetailerDashboard() {
  const [incomingOrders, setIncomingOrders] = useState([]);

  useEffect(() => {
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    try {
      console.log('Fetching pending orders...');
      const data = await getPendingOrders();
      // TODO: In a real app, filter to show only this retailer’s orders.
      setIncomingOrders(data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Mark order ${orderId} as ${newStatus}?`)) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      alert('Order status updated!');
      fetchIncomingOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  return (
    <Container className="my-4">
      <Row>
        {/* Sidebar / Navigation Column */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Retailer Menu</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action active>
                Manage Products
              </ListGroup.Item>
              <ListGroup.Item action>View Orders</ListGroup.Item>
              <ListGroup.Item action as={Link} to="/profile">
                Account Settings
              </ListGroup.Item>
              <ListGroup.Item action>Analytics (Coming Soon)</ListGroup.Item>
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
              <Button variant="primary">+ Add New Product</Button>
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
                  {dummyMyProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

          {/* Section 2: Incoming Orders */}
          <hr className="my-5" />
          <section>
            <h4>Incoming Orders</h4>
            {incomingOrders.length === 0 ? (
              <p>No incoming orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="inventory-table table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Total</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingOrders.map((order) => (
                      <tr key={order.id}>
                        <td title={order.id}>{order.id.substring(0, 6)}...</td>
                        <td title={order.userId}>
                          {order.userId.substring(0, 6)}...
                        </td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>{order.deliveryAddress}</td>
                        <td>{order.status}</td>
                        <td>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleUpdateStatus(order.id, 'Shipped')
                            }
                          >
                            Mark Shipped
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, 'Canceled')
                            }
                          >
                            Cancel Order
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Col>
      </Row>
    </Container>
  );
}

export default RetailerDashboard;
