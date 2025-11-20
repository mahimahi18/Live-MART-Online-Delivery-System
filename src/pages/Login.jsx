import { useState } from "react";
// Import useNavigate and Link from React Router
import { useNavigate, Link } from "react-router-dom"; 
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
// Import the pre-initialized auth and db from your firebase.js
import { auth, db } from "../firebase";

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Google } from 'react-bootstrap-icons'; // Assuming you have this package installed

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  // --- 1. EMAIL/PASSWORD LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      checkUserRole(user.uid);
    } catch (error) {
      console.error(error);
      alert("Login failed: " + error.message);
    }
  };

  // --- 2. GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if this user exists in Firestore. If not, create them as a Customer.
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create default Customer profile for new Google users
        await setDoc(userDocRef, {
          email: user.email,
          role: "Customer",
          name: user.displayName || "Google User",
          createdAt: new Date().toISOString()
        });
        navigate("/customer-dashboard");
      } else {
        // User exists, just check role
        checkUserRole(user.uid);
      }

    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.message);
    }
  };

  // --- HELPER: CHECK ROLE & REDIRECT ---
  const checkUserRole = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === "Customer") navigate("/customer-dashboard");
      else if (role === "Retailer") navigate("/retailer-dashboard");
      else navigate("/wholesaler-dashboard");
    } else {
      alert("User data not found!");
      navigate("/"); 
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <div className="shadow p-4 rounded bg-white">
            <h2 className="text-center mb-4 fw-bold">Login</h2>
            
            <Form onSubmit={handleLogin}>
              {/* Email Field */}
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter email" 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>

              {/* Password Field */}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Password" 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>

              {/* Login Button */}
              <div className="d-grid gap-2 mb-3">
                <Button variant="primary" type="submit" size="lg">
                  Login
                </Button>
              </div>
            </Form>

            {/* Divider */}
            <div className="d-flex align-items-center my-3">
              <div className="border-bottom w-100"></div>
              <span className="px-2 text-muted">OR</span>
              <div className="border-bottom w-100"></div>
            </div>

            {/* Google Login Button */}
            <div className="d-grid gap-2">
              <Button variant="outline-danger" size="lg" onClick={handleGoogleLogin}>
                <Google className="me-2" /> Sign in with Google
              </Button>
            </div>
            
            {/* Link to Signup Page */}
            <div className="text-center mt-4">
              Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up here</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;