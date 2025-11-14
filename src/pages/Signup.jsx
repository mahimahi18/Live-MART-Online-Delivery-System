import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// We import the pre-initialized auth and db from our firebase.js
import { auth, db } from "../firebase";

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

//const auth = getAuth(app);
//const db = getFirestore(app);

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save additional info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        role,
      });
      alert("Signup successful!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">Create Your Account</h2>
          <Form onSubmit={handleSignup}>
            {/* Name Field */}
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your full name" 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </Form.Group>

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

            {/* Phone Field */}
            <Form.Group className="mb-3" controlId="formBasicPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="Enter phone number" 
                onChange={(e) => setPhone(e.target.value)} 
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

            {/* Role Field */}
            <Form.Group className="mb-3" controlId="formBasicRole">
              <Form.Label>I am a...</Form.Label>
              <Form.Select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Customer">Customer</option>
                <option value="Retailer">Retailer</option>
                <option value="Wholesaler">Wholesaler</option>
              </Form.Select>
            </Form.Group>

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg">
                Signup
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;