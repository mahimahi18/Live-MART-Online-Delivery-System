import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card'; // <--- Added missing import

function WholesalerInventory() {
  // --- STOCK DATA ---
  const [inventory] = useState([
    { id: 1, name: 'Organic Apples (Bulk Crate)', stock: 500, price: 45.00 },
    { id: 2, name: 'Premium Rice (25kg Sack)', stock: 120, price: 55.00 },
    { id: 3, name: 'Potatoes (50kg Sack)', stock: 50, price: 30.00 },
  ]);

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Wholesale Inventory</h1>
        <p className="lead fs-4">Manage bulk stock and retailer pricing.</p>
      </Container>

      <Container className="my-5">
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Table responsive hover className="mb-0">
                <thead className="bg-light">
                    <tr>
                    <th>Item Name</th>
                    <th>Current Stock (Units)</th>
                    <th>Unit Price ($)</th>
                    <th className="text-end">Update</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map(item => (
                    <tr key={item.id}>
                        <td className="fw-bold align-middle">{item.name}</td>
                        <td className="align-middle">
                            <Form.Control type="number" defaultValue={item.stock} style={{width: '100px'}} />
                        </td>
                        <td className="align-middle">
                            <Form.Control type="number" defaultValue={item.price} style={{width: '100px'}} />
                        </td>
                        <td className="text-end align-middle">
                            <Button variant="primary" size="sm">Save Changes</Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default WholesalerInventory;