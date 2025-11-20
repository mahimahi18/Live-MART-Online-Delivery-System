import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, onSnapshot, doc, runTransaction } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

// Import Icons
import { StarFill, StarHalf, Star } from 'react-bootstrap-icons';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null); 
  const navigate = useNavigate();

  // --- 1. FETCH ALL PRODUCTS ---
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError("Failed to load products.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. ADD TO CART LOGIC (FIXED) ---
  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      setAdding(null);
      return;
    }

    const cartItemRef = doc(db, "users", user.uid, "cart", product.id);

    try {
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartItemRef);
        
        if (cartDoc.exists()) {
          const newQuantity = cartDoc.data().quantity + 1;
          transaction.update(cartItemRef, { quantity: newQuantity });
        } else {
          // --- CRITICAL FIX HERE ---
          // We removed 'isProxy' and ensured price is a Number.
          // We also simplified the image logic to prevent database errors.
          transaction.set(cartItemRef, { 
            name: product.name,
            price: Number(product.price), // Ensure this is a Number, not a String
            image: product.imageUrl || '', 
            quantity: 1
          });
        }
      });
      console.log(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart: ", err);
      alert("Error adding to cart. Please try again.");
    } finally {
      setAdding(null);
    }
  };

  // --- 3. RENDER STARS ---
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<StarFill key={`f-${i}`} />);
    if (halfStar) stars.push(<StarHalf key="h" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<Star key={`e-${i}`} />);
    return <div className="text-warning">{stars}</div>;
  };

  // --- 4. MAIN RENDER ---
  return (
    <>
      {/* Hero Section */}
      <Container
        fluid
        className="p-5 mb-5 text-center text-white shadow-lg"
        style={{ 
          background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' 
        }}
      >
        <h1 className="display-3 fw-bold">All Products</h1>
        <p className="lead fs-4">Find exactly what you need.</p>
      </Container>

      {/* Products Grid */}
      <Container className="my-5">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Row className="g-4">
            {products.map((product) => {
              // Ensure price is a number for display
              const price = Number(product.price) || 0;
              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock <= 0;

              return (
                <Col md={6} lg={4} key={product.id}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Img 
                      variant="top" 
                      src={product.imageUrl || 'https://placehold.co/600x400/eee/aaa?text=No+Image'} 
                      alt={product.name} 
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold">{product.name}</Card.Title>
                      <Card.Text className="text-muted">{product.description}</Card.Text>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-success fw-bold mb-0">${price.toFixed(2)}</h4>
                        {renderStars(product.rating)}
                      </div>

                      <Button 
                        variant={isOutOfStock ? "secondary" : "primary"}
                        className="mt-auto w-100"
                        onClick={() => handleAddToCart(product)}
                        disabled={adding === product.id || isOutOfStock}
                      >
                        {isOutOfStock ? 'Out of Stock' : (adding === product.id ? 'Adding...' : 'Add to Cart')}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </>
  );
}