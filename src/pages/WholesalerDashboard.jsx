import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge'; // We'll use Badges for status

// Placeholder for incoming bulk orders from retailers
const dummyBulkOrders = [
  { id: "BLK-771", retailer: "Retailer A", items: 5, total: 1500.00, status: "Pending" },
  { id: "BLK-772", retailer: "Retailer B", items: 2, total: 800.00, status: "Confirmed" },
  { id: "BLK-773", retailer: "Retailer A", items: 10, total: 4500.00, status: "Pending" },
];

// Placeholder for wholesaler's inventory
const dummyInventory = [
  { sku: "TSHIRT-M-BLK", name: "Men's T-Shirt (Case)", stock: 50, unit: "Case (100 units)" },
  { sku: "JEANS-W-BLU", name: "Women's Jeans (Pallet)", stock: 20, unit: "Pallet (50 units)" },
  { sku: "HOODIE-U-GRY", name: "Unisex Hoodie (Case)", stock: 80, unit: "Case (50 units)" },
];


function WholesalerDashboard() {
  return (
    <Container className="my-4">
      <Row>
        {/* Sidebar / Navigation Column */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Wholesaler Menu</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action active> {/* 'active' highlights this item */}
                Bulk Orders
              </ListGroup.Item> {/* <-- FIXED ERROR (was ListGrop) */}
              <ListGroup.Item action>
                Inventory
              </ListGroup.Item>
              <ListGroup.Item action>
                Retailer Network
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/profile">
                Account Settings
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Main Content Column */}
        <Col md={9}>
          <h2>Welcome, Wholesaler!</h2>
          <p>Manage bulk orders from retailers and oversee your inventory.</p>
          
          <hr className="my-4" />

          {/* Section 1: Pending Bulk Orders */}
          <section>
            <h4>Pending Bulk Orders</h4>
            <Card>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Retailer</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyBulkOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.retailer}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <Badge bg={order.status === "Pending" ? "warning" : "success"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          Review Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

          {/* Section 2: Inventory Management */}
          <section className="mt-5">
            <h4>Inventory Overview</h4>
            <Card>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Unit Type</th>
                    <th>Stock on Hand</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyInventory.map(item => (
                    <tr key={item.sku}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.unit}</td>
                      <td>{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

        </Col>
      </Row>
    </Container>
  );
}

export default WholesalerDashboard;