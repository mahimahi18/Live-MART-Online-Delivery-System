import { useState } from "react";
// Import useNavigate and Link from React Router
import { useNavigate, Link } from "react-router-dom"; 
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../firebase";

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const auth = getAuth(app);
const db = getFirestore(app);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Get role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        
        // **FIX:** Use navigate() instead of window.location.href
        if (role === "Customer") navigate("/customer-dashboard");
        else if (role === "Retailer") navigate("/retailer-dashboard");
        else navigate("/wholesaler-dashboard");

      } else {
        // Handle case where user exists in Auth but not in Firestore
        alert("User data not found!");
        navigate("/"); // Send them home
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">Login to Your Account</h2>
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

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg">
                Login
              </Button>
            </div>
          </Form>
          
          {/* Link to Signup Page */}
          <div className="text-center mt-3">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;