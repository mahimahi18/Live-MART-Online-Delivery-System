import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Import db and auth
import { collection, doc, onSnapshot, deleteDoc, runTransaction } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';

// Import Icons
import { Trash, Plus, Dash } from 'react-bootstrap-icons';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- 1. REAL-TIME CART LISTENER ---
  useEffect(() => {
    // First, listen for auth changes
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);

        // --- User is logged in, attach the REAL-TIME listener for their cart ---
        const cartRef = collection(db, "users", currentUser.uid, "cart");
        const dbUnsubscribe = onSnapshot(cartRef, (querySnapshot) => {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          setCartItems(items);
          setLoading(false);
        }, (error) => {
          console.error("Error listening to cart: ", error);
          setLoading(false);
        });

        // Return the *database* unsubscribe function to clean up when component unmounts
        return () => dbUnsubscribe();

      } else {
        // No user, clear everything
        setUser(null);
        setCartItems([]);
        setLoading(false);
        navigate('/login'); // Optional: redirect to login if they try to see cart
      }
    });

    // Return the *auth* unsubscribe function
    return () => authUnsubscribe();
  }, [navigate]); // Add navigate as dependency

  // --- 2. "REMOVE FROM CART" FUNCTION ---
  const handleRemove = async (itemId) => {
    if (!user) return; // Should not happen, but good check
    const itemRef = doc(db, "users", user.uid, "cart", itemId);
    try {
      await deleteDoc(itemRef);
      console.log("Item removed!");
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  // --- 3. "UPDATE QUANTITY" FUNCTION ---
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (!user) return;

    // If quantity is 0 or less, remove the item
    if (newQuantity <= 0) {
      handleRemove(itemId);
      return;
    }

    const itemRef = doc(db, "users", user.uid, "cart", itemId);
    try {
      // Use a transaction to be safe, though updateDoc is also fine
      await runTransaction(db, async (transaction) => {
        transaction.update(itemRef, { quantity: newQuantity });
      });
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  };

  // --- 4. CALCULATE TOTALS ---
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + (price * quantity);
  }, 0);
  
  const shipping = 0.00; // You can add logic for this later
  const total = subtotal + shipping;

  // --- 5. RENDER THE PAGE ---
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
        <h1 className="display-3 fw-bold">Shopping Cart</h1>
        <p className="lead fs-4">
          Ready to check out?
        </p>
      </Container>

      {/* 2. Cart Content */}
      <Container className="my-5">
        <Row>
          {/* --- LEFT SIDE: CART ITEMS --- */}
          <Col md={8}>
            <h2 className="mb-4">Your Items</h2>
            {loading ? (
              // Show a loading spinner while fetching
              <div className="text-center">
                <Spinner animation="border" variant="success" role="status" />
                <p className="mt-2">Loading Cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              // Show if cart is empty
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <Card.Title>Your cart is empty.</Card.Title>
                  <Card.Text>
                    Looks like you haven't added anything yet.
                  </Card.Text>
                  <Button variant="primary" onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              // Show cart items
              <Stack gap={3}>
                {cartItems.map((item) => (
                  <Card key={item.id} className="shadow-sm border-0">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={2}>
                          <Image 
                            src={item.image || 'https://placehold.co/100x100/eee/aaa?text=Image'} 
                            alt={item.name} 
                            fluid 
                            rounded 
                          />
                        </Col>
                        <Col md={3}>
                          <h5 className="fw-bold mb-0">{item.name}</h5>
                        </Col>
                        <Col md={3}>
                          {/* Quantity Controls */}
                          <Stack direction="horizontal" gap={2} className="align-items-center">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Dash />
                            </Button>
                            <span className="fw-bold">{item.quantity}</span>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus />
                            </Button>
                          </Stack>
                        </Col>
                        <Col md={2}>
                          {/* Price */}
                          <h5 className="text-success mb-0">
                            ${(Number(item.price) || 0).toFixed(2)}
                          </h5>
                        </Col>
                        <Col md={2} className="text-end">
                          {/* Remove Button */}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Stack>
            )}
          </Col>

          {/* --- RIGHT SIDE: SUMMARY --- */}
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title as="h2" className="mb-4">Summary</Card.Title>
                <Stack gap={3}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Shipping</span>
                    <span className="fw-bold">${shipping.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <h4 className="mb-0">Total</h4>
                    <h4 className="fw-bold text-success mb-0">${total.toFixed(2)}</h4>
                  </div>
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100 mt-3" 
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}