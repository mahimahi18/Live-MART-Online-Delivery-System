import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// --- FIX START ---
// We import the pre-initialized auth and db, not app
import { auth, db } from "./firebase"; 
// We import the functions we need
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
// --- FIX END ---
import { useEffect, useState } from "react";

// ✅ Import all pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import WholesalerDashboard from "./pages/WholesalerDashboard";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import ProductForm from "./pages/ProductForm";

// ✅ React-Bootstrap imports
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import ProtectedRoute from "./components/ProtectedRoute"; // Make sure this file is also fixed!

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // const auth = getAuth(app); // No longer needed
  // const db = getFirestore(app); // No longer needed

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 'auth' and 'db' are now the direct imports
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            setRole("customer"); // default fallback
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // We can remove auth and db from dependencies, as they are stable imports

  const handleLogout = async () => {
    await signOut(auth); // 'auth' is the direct import
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Router>
      {/* ✅ Navigation Bar */}
      <Navbar bg="light" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">LiveMart</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>

              {user && (
                <>
                  <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
                  <Nav.Link as={Link} to="/my-orders">My Orders</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </>
              )}

              {/* ✅ Role-based Dashboards */}
              {user && role === "Customer" && ( // Fixed logic to check role
                <Nav.Link as={Link} to="/customer-dashboard">Customer Dashboard</Nav.Link>
              )}
              {user && role === "Retailer" && ( // Fixed logic to check role
                <Nav.Link as={Link} to="/retailer-dashboard">Retailer Dashboard</Nav.Link>
              )}
              {user && role === "Wholesaler" && ( // Fixed logic to check role
                <Nav.Link as={Link} to="/wholesaler-dashboard">Wholesaler Dashboard</Nav.Link>
              )}
            </Nav>

            <Nav>
              {!user ? (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="btn btn-primary text-dark">
                    Signup
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ✅ Routes */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* ✅ Role-protected Dashboards */}
          <Route path="/customer-dashboard" element={
            <ProtectedRoute allowedRole="customer" userRole={role}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/retailer-dashboard" element={
            <ProtectedRoute allowedRole="retailer" userRole={role}>
              <RetailerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/wholesaler-dashboard" element={
            <ProtectedRoute allowedRole="wholesaler" userRole={role}>
              <WholesalerDashboard />
            </ProtectedRoute>
          } />
          
          {/* You were missing these routes from your *new* file */}
          <Route path="/add-product" element={<ProtectedRoute allowedRole="retailer" userRole={role}><ProductForm /></ProtectedRoute>} />
          <Route path="/edit-product/:productId" element={<ProtectedRoute allowedRole="retailer" userRole={role}><ProductForm /></ProtectedRoute>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;