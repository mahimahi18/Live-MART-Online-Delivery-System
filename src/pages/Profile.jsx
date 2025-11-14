import { useState, useEffect } from 'react';
import { signOut } from "firebase/auth"; // We only need signOut
import { doc, getDoc } from "firebase/firestore"; // We only need doc and getDoc
import { useNavigate } from 'react-router-dom';
// Import the pre-initialized auth and db from firebase.js
import { auth, db } from "../firebase";

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

//const auth = getAuth(app);
//const db = getFirestore(app);

function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "Loading...",
    phone: "Loading...",
    role: "Loading..."
  });

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
        alert("You must be logged in to view this page.");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]); // Add navigate as a dependency

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error logging out:", error);
      alert(error.message);
    }
  };

  return (
    <Container className="my-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1 className="mb-4">👤 Your Profile</h1>
          <Card>
            <Card.Body>
              <Form>
                <Form.Group as={Row} className="mb-3" controlId="formProfileName">
                  <Form.Label column sm={3}>Name:</Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" value={userProfile.name} readOnly />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProfileEmail">
                  <Form.Label column sm={3}>Email:</Form.Label>
                  <Col sm={9}>
                    <Form.Control type="email" value={userProfile.email} readOnly />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProfilePhone">
                  <Form.Label column sm={3}>Phone:</Form.Label>
                  <Col sm={9}>
                    <Form.Control type="tel" value={userProfile.phone} readOnly />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProfileRole">
                  <Form.Label column sm={3}>Role:</Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" value={userProfile.role} readOnly />
                  </Col> {/* <-- FIXED ERROR 2 */}
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
  );
}

export default Profile;