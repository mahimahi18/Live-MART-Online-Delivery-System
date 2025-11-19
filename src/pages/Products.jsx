import { useState, useEffect } from 'react';
// --- FIX: Correcting the firebase import path ---
import { db, auth } from '../firebase'; // This path goes UP one directory (from pages to src)
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Import React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner'; // For loading

// Import Icons
import { StarFill, StarHalf, Star } from 'react-bootstrap-icons';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null); // Tracks which product is being added
  const navigate = useNavigate();

  // --- 1. FETCH ALL PRODUCTS ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
        // You could show an error toast here
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // --- 2. "ADD TO CART" LOGIC (Copied from Home.js) ---
  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      setAdding(null);
      return;
    }

    // FIX: Using correct path for user's cart
    const cartItemRef = doc(db, "users", user.uid, "cart", product.id);

    try {
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartItemRef);
        
        if (cartDoc.exists()) {
          const newQuantity = cartDoc.data().quantity + 1;
          transaction.update(cartItemRef, { quantity: newQuantity });
        } else {
          // FIX: Ensure we use the correct field name. Your screenshot implies it's not "imageUrl"
          // Let's use 'image' as a fallback, or just what's on the product
          // We MUST match the field name from your 'products' collection.
          // I will assume your product objects have 'name', 'price', and 'imageUrl'
          transaction.set(cartItemRef, { 
            name: product.name,
            price: product.price,
            image: product.imageUrl || 'https://placehold.co/600x400/green/white?text=No+Image', // Use a fallback
            quantity: 1 ,
            isProxy: product.isProxy || false // This is the new line
          });
        }
      });
      console.log(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart: ", error);
    } finally {
      setAdding(null);
    }
  };

  // Helper to render stars (optional, but looks good)
  const renderStars = (rating) => {
    // ... (this is optional, can be removed if you don't have ratings)
  };

  // --- 3. RENDER THE PAGE ---
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
        <h1 className="display-3 fw-bold">All Products</h1>
        <p className="lead fs-4">
          Find exactly what you need.
        </p>
      </Container>

      {/* 2. Products Grid */}
      <Container className="my-5">
        {loading ? (
          // Show a loading spinner while fetching
          <div className="text-center">
            <Spinner animation="border" variant="success" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading Products...</p>
          </div>
        ) : (
          // Once loaded, show the grid
          <Row className="g-4">
            {products.map((product) => {
              // --- FIX: Safer data handling ---
              const price = typeof product.price === 'number' ? product.price : 0;
              // Check stock. Coerce to number in case it's a string.
              const stock = Number(product.stock) || 0; 
              const isOutOfStock = stock === 0;

              return (
                <Col md={6} lg={4} key={product.id}>
                  {/* --- PREMIUM CARD (Copied from Home.js) --- */}
                  <Card className="shadow border-0 h-100">
                    <Card.Img 
                      variant="top" 
                      // FIX: Use the 'imageUrl' from your product data.
                      src={product.imageUrl || 'https://placehold.co/600x400/eee/aaa?text=Image+Missing'} 
                      alt={product.name} 
                      style={{ height: '250px', objectFit: 'cover' }}
                      // Add an error fallback
                      onError={(e) => { e.target.src = 'https://placehold.co/600x400/eee/aaa?text=Image+Broken'; }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold">{product.name || 'Untitled Product'}</Card.Title>
                      <Card.Text>
                        {product.description || 'No description available.'}
                      </Card.Text>
                      
                      {/* Price and Rating */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-success fw-bold mb-0">${price.toFixed(2)}</h4>
                        {/* You can add a rating field to your products later */}
                      </div>

                      {/* UPDATED BUTTON with stock check */}
                      <Button 
                        variant={isOutOfStock ? "secondary" : "primary"}
                        className="mt-auto w-100"
                        onClick={() => handleAddToCart(product)}
                        disabled={adding === product.id || isOutOfStock}
                      >
                        {isOutOfStock ? 'Out of Stock' : (adding === product.id ? 'Adding...' : 'Add to Cart')}
                      </Button>{/* <-- THIS WAS THE FIX. Was </ThisButton> */}
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