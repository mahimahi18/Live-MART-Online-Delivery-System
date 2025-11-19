import { useState, useEffect } from 'react';
import { signOut } from "firebase/auth"; // We only need signOut
import { doc, getDoc } from "firebase/firestore"; // We only need doc and getDoc
import { useNavigate } from 'react-router-dom';
// Import the pre-initialized auth and db from firebase.js
import { auth, db } from "../firebase";

// --- NEW: Import React-Bootstrap Components ---
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner'; // For loading state

function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null); // Start as null
  const [loading, setLoading] = useState(true);

  // This useEffect will run once when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // User is signed in, fetch their data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          // Handle case where user exists in Auth but not in Firestore
          console.error("No user data found in Firestore!");
          setUserProfile({ name: "Error", email: user.email, phone: "N/A", role: "N/A" });
        }
      } else {
        // No user is signed in, redirect to login
        // Removed alert, navigate is cleaner
        navigate("/login");
      }
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]); // Add navigate as a dependency

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Removed alert, console log is better
      console.log("Logged out successfully!");
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error logging out:", error);
      // alert(error.message); // Avoid alerts
    }
  };

  // --- THEMED RENDER ---

  if (loading || !userProfile) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="success" role="status" />
        <h1 className="mt-3">Loading Profile...</h1>
      </Container>
    );
  }

  return (
    <>
      {/* 1. "Mini-Hero" Section for Theme Consistency */}
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{ 
          background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' 
        }}
      >
        <h1 className="display-3 fw-bold">👤 Your Profile</h1>
        <p className="lead fs-4">
          View your account details.
        </p>
      </Container>

      {/* 2. Profile Content */}
      <Container className="my-5">
        <Row className="justify-content-md-center">
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <Form>
                  <Form.Group as={Row} className="mb-3" controlId="formProfileName">
                    <Form.Label column sm={3} className="fw-bold">Name:</Form.Label>
                    <Col sm={9}>
                      {/* Using plaintext for a cleaner read-only look */}
                      <Form.Control plaintext readOnly value={userProfile.name} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3" controlId="formProfileEmail">
                    <Form.Label column sm={3} className="fw-bold">Email:</Form.Label>
                    <Col sm={9}>
                      <Form.Control plaintext readOnly value={userProfile.email} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3" controlId="formProfilePhone">
                    <Form.Label column sm={3} className="fw-bold">Phone:</Form.Label>
                    <Col sm={9}>
                      <Form.Control plaintext readOnly value={userProfile.phone} />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3" controlId="formProfileRole">
                    <Form.Label column sm={3} className="fw-bold">Role:</Form.Label>
                    <Col sm={9}>
                      <Form.Control plaintext readOnly value={userProfile.role} />
                    </Col>
                  </Form.Group>
                  
                  {/* You could add an "Update Profile" button here if you build that functionality */}
                  
                </Form>
              </Card.Body>
            </Card>
            
            <div className="d-grid gap-2 mt-4">
              <Button variant="danger" size="lg" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Profile;