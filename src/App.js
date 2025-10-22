import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Placeholder for Home page
function Home() {
  return <div><h1>Home Page</h1></div>;
}

// Placeholder for Products page
function Products() {
  return <div><h1>Products Page</h1></div>;
}

// Placeholder for Cart page
function Cart() {
  return <div><h1>Cart Page</h1></div>;
}

// Placeholder for Profile page
function Profile() {
  return <div><h1>Profile Page</h1></div>;
}

// Placeholder for Signup page
function Signup() {
  return <div><h1>Signup Page</h1></div>;
}

// Placeholder for Login page
function Login() {
  return <div><h1>Login Page</h1></div>;
}

// --- End of placeholder components ---


function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee", flexWrap: "wrap" }}>
        <Link to="/" style={{ margin: "10px" }}>Home</Link>
        <Link to="/products" style={{ margin: "10px" }}>Products</Link>
        <Link to="/cart" style={{ margin: "10px" }}>Cart</Link>
        <Link to="/profile" style={{ margin: "10px" }}>Profile</Link>
        <Link to="/signup" style={{ margin: "10px" }}>Signup</Link>
        <Link to="/login" style={{ margin: "10px" }}>Login</Link>

      </nav>

      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />

        {/* Auth + dashboard routes (these were already correct) */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

