import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import WholesalerDashboard from "./pages/WholesalerDashboard";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
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

        {/* New auth + dashboard routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/wholesaler-dashboard" element={<WholesalerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;