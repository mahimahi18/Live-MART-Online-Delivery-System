import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { auth, db } from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

// Import all existing pages
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
import Checkout from "./pages/Checkout";

// ⭐ Phone Login Import
import LoginWithPhone from "./pages/LoginWithPhone"; 

// ⭐ Shops Near Me (Active)
import ShopsNearMe from "./pages/ShopsNearMe";

// ⭐ NEW RETAILER PAGES
import RetailerInventory from "./pages/RetailerInventory";
import RetailerSalesHistory from "./pages/RetailerSalesHistory";
import WholesaleMarket from "./pages/WholesaleMarket";
import RetailerOrders from "./pages/RetailerOrders";

// ⭐ NEW WHOLESALER PAGES
import WholesalerInventory from "./pages/WholesalerInventory";
import WholesalerIncomingOrders from "./pages/WholesalerIncomingOrders";
import WholesalerTransactionHistory from "./pages/WholesalerTransactionHistory";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown"; 
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ProtectedRoute from "./components/ProtectedRoute"; 
import { Shop } from "react-bootstrap-icons";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function AppFooter() {
  return (
    <footer className="py-4 mt-5 bg-dark text-white">
      <Container>
        <Row>
          <Col md={4}>
            <h5>LiveMart</h5>
            <p>Freshness delivered to your doorstep.</p>
          </Col>
          <Col md={2}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white text-decoration-none">Home</Link></li>
              <li><Link to="/products" className="text-white text-decoration-none">Products</Link></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contact</h5>
            <p>123 Fresh St, Green Valley, 90210</p>
          </Col>
          <Col md={3}>
            <h5>Follow Us</h5>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3">
            <p>&copy; {new Date().getFullYear()} LiveMart. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role.trim().toLowerCase());
          } else {
            setRole("customer");
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
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Router>
      <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-success">
            <Shop size={30} className="me-2" />
            LiveMart
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
              <Nav.Link as={Link} to="/shops-near-me">Shops Near Me</Nav.Link>

              {/* ⭐ CUSTOMER SPECIFIC LINKS (Hidden for Retailers/Wholesalers) */}
              {user && role === "customer" && (
                <>
                  <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
                  <Nav.Link as={Link} to="/my-orders">My Orders</Nav.Link>
                  <Nav.Link as={Link} to="/customer-dashboard">Dashboard</Nav.Link>
                </>
              )}

              {/* ⭐ RETAILER SPECIFIC LINKS (Hidden for Customers/Wholesalers) */}
              {user && role === "retailer" && (
                <NavDropdown title="Retailer Menu" id="retailer-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/retailer-dashboard">Dashboard</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/retailer-inventory">Inventory</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/retailer-sales">Sales History</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/wholesale-market">Buy Stock</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/retailer-orders">My Wholesale Orders</NavDropdown.Item>
                </NavDropdown>
              )}

              {/* ⭐ WHOLESALER SPECIFIC LINKS (Hidden for Customers/Retailers) */}
              {user && role === "wholesaler" && (
                <NavDropdown title="Wholesaler Menu" id="wholesaler-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/wholesaler-dashboard">Dashboard</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/wholesaler-inventory">Inventory</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/wholesaler-incoming-orders">Incoming Orders</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/wholesaler-history">Transaction History</NavDropdown.Item>
                </NavDropdown>
              )}

              {/* ⭐ COMMON LINKS (Visible to ALL logged in users) */}
              {user && (
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              )}
            </Nav>

            <Nav>
              {!user ? (
                <>
                  <Nav.Link as={Link} to="/login-phone" className="me-2">Phone Login</Nav.Link>
                  <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                  <Button as={Link} to="/signup" variant="primary">Signup</Button>
                </>
              ) : (
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login-phone" element={<LoginWithPhone />} />
        <Route path="/shops-near-me" element={<ShopsNearMe />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Role logic handled inside ProtectedRoute */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

        {/* --- CUSTOMER ROUTES --- */}
        <Route path="/customer-dashboard" element={
          <ProtectedRoute allowedRole="customer" userRole={role}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        {/* --- RETAILER ROUTES --- */}
        <Route path="/retailer-dashboard" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <RetailerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/retailer-inventory" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <RetailerInventory />
          </ProtectedRoute>
        } />
        <Route path="/retailer-sales" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <RetailerSalesHistory />
          </ProtectedRoute>
        } />
        <Route path="/wholesale-market" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <WholesaleMarket />
          </ProtectedRoute>
        } />
        <Route path="/retailer-orders" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <RetailerOrders />
          </ProtectedRoute>
        } />
        <Route path="/add-product" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/edit-product/:productId" element={
          <ProtectedRoute allowedRole="retailer" userRole={role}>
            <ProductForm />
          </ProtectedRoute>
        } />

        {/* --- WHOLESALER ROUTES --- */}
        <Route path="/wholesaler-dashboard" element={
          <ProtectedRoute allowedRole="wholesaler" userRole={role}>
            <WholesalerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/wholesaler-inventory" element={
          <ProtectedRoute allowedRole="wholesaler" userRole={role}>
            <WholesalerInventory />
          </ProtectedRoute>
        } />
        <Route path="/wholesaler-incoming-orders" element={
          <ProtectedRoute allowedRole="wholesaler" userRole={role}>
            <WholesalerIncomingOrders />
          </ProtectedRoute>
        } />
        <Route path="/wholesaler-history" element={
          <ProtectedRoute allowedRole="wholesaler" userRole={role}>
            <WholesalerTransactionHistory />
          </ProtectedRoute>
        } />

      </Routes>

      <AppFooter />
    </Router>
  );
}

export default App;