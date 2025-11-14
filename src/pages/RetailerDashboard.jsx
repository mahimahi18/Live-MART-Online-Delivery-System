import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getMyProducts, deleteProduct } from '../services/productService';
import { auth } from '../firebase'; 
import './RetailerDashboard.css';

//const auth = getAuth(app);

export default function RetailerDashboard() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch retailer's products
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchMyProducts(currentUser.uid);
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchMyProducts = async (uid) => {
    try {
      setLoading(true);
      const data = await getMyProducts(uid);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      alert('Product deleted!');
      if (user) fetchMyProducts(user.uid);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <h2>Loading your dashboard...</h2>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">🧑‍💼 Retailer Dashboard</h1>
      <p className="text-center">Welcome, {user?.email}</p>

      <div className="d-flex justify-content-between align-items-center my-4">
        <h3>Your Products</h3>
        <Link to="/add-product">
          <Button variant="primary">+ Add New Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <h5 className="text-center text-muted">You have no products yet.</h5>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <Link to={`/edit-product/${p.id}`}>
                      <Button variant="outline-secondary" size="sm" className="me-2">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}
