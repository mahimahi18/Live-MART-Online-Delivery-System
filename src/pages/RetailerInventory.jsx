import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

function RetailerInventory() {
  // --- STOCK DATA ---
  const [inventory, setInventory] = useState([
    { id: 'p1', name: 'Fresh Organic Apples', price: 3.50, stock: 45, category: 'Fruits' },
    { id: 'p2', name: 'Whole Milk (1 Gallon)', price: 5.99, stock: 12, category: 'Dairy' },
    { id: 'p3', name: 'Sourdough Bread', price: 4.25, stock: 0, category: 'Bakery' }, // Out of stock example
    { id: 'p4', name: 'Free-Range Eggs (Dozen)', price: 6.50, stock: 28, category: 'Dairy' },
  ]);

  return (
    <>
      {/* THEME HEADER */}
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">My Inventory</h1>
        <p className="lead fs-4">Manage your shop's stock and pricing.</p>
      </Container>

      <Container className="my-5">
        <div className="d-flex justify-content-end mb-3">
            <Button variant="success" href="/add-product">+ Add New Item</Button>
        </div>
        
        <div className="shadow-sm rounded border-0 overflow-hidden">
            <Table hover responsive className="mb-0 bg-white">
            <thead className="bg-light">
                <tr>
                <th className="py-3 ps-4">Product Name</th>
                <th className="py-3">Category</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock Status</th>
                <th className="py-3 text-end pe-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {inventory.map((item) => (
                <tr key={item.id}>
                    <td className="ps-4 fw-bold align-middle">{item.name}</td>
                    <td className="align-middle"><Badge bg="secondary">{item.category}</Badge></td>
                    <td className="align-middle">${item.price.toFixed(2)}</td>
                    <td className="align-middle">
                        {item.stock > 0 ? (
                            <span className="text-success fw-bold">{item.stock} in stock</span>
                        ) : (
                            <span className="text-danger fw-bold">Out of Stock</span>
                        )}
                    </td>
                    <td className="text-end pe-4 align-middle">
                        <Button variant="outline-primary" size="sm" className="me-2">
                            <PencilSquare />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                            <Trash />
                        </Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </div>
      </Container>
    </>
  );
}

export default RetailerInventory;