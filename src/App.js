import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import app from "./firebase"; 
import './App.css'; 

// Import pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import WholesalerDashboard from "./pages/WholesalerDashboard";
import Profile from "./pages/Profile"; 

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function App() {
  return (
    <Router>
      {/* This replaces your old <nav> */}
      <Navbar bg="light" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">LiveMart</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* We use 'as={Link}' and 'to="..."' to combine 
                React-Bootstrap's style with React-Router's functionality.
              */}
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
              <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link> 
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              {/* FIXED: Changed "text-white" to "text-dark" to make it visible
                on the light background.
              */}
              <Nav.Link as={Link} to="/signup" className="btn btn-primary text-dark">Signup</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Your Page Routes */}
      <div className="container mt-4"> {/* Adds padding to your pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
          <Route path="/wholesaler-dashboard" element={<WholesalerDashboard />} />
          <Route path="/profile" element={<Profile />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;