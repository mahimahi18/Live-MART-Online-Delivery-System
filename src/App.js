import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Products from "./pages/Products";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/" style={{ margin: "10px" }}>Home</Link>
        <Link to="/products" style={{ margin: "10px" }}>Products</Link>
        <Link to="/cart" style={{ margin: "10px" }}>Cart</Link>
        <Link to="/profile" style={{ margin: "10px" }}>Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
