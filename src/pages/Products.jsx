import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
// We kept the Firestore imports needed for the CART, but removed the ones for reviews
import { 
  collection, 
  onSnapshot, 
  doc, 
  runTransaction 
} from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

// React-Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

// Icons
import { StarFill, StarHalf, Star, ChatLeftText } from 'react-bootstrap-icons';

// ⭐ FAKE DATA GENERATOR (To make it look real)
const MOCK_REVIEWS = [
  { id: 101, userName: "Alice M.", rating: 5, comment: "Absolutely love this! Great quality.", date: new Date() },
  { id: 102, userName: "John D.", rating: 4, comment: "Good value for money, fast shipping.", date: new Date() },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ⭐ REVIEWS STATE (Local Only)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [reviews, setReviews] = useState([]); // Local array for reviews
  
  // Form State
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();

  // ------------------- FETCH PRODUCTS (From Firebase) -------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products: ", err);
        setError("Failed to load products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ------------------- ADD TO CART (Kept connected to Firebase) -------------------
  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
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
          transaction.set(cartItemRef, {
            name: product.name,
            price: Number(product.price),
            image: product.imageUrl || "",
            quantity: 1,
          });
        }
      });
    } catch (err) {
      console.error("Error adding to cart: ", err);
      alert("Error adding to cart.");
    } finally {
      setAdding(null);
    }
  };

  // ------------------- FAKE REVIEW SUBMIT -------------------
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (userRating === 0) {
      alert("Please select a star rating.");
      return;
    }

    setSubmittingReview(true);

    // 2. Simulate network delay (makes it feel real)
    setTimeout(() => {
      const user = auth.currentUser;
      
      // Create a fake review object
      const newReview = {
        id: Date.now(), // Generate a random ID
        userName: user ? (user.displayName || user.email) : "Guest User",
        rating: userRating,
        comment: userComment,
        date: new Date()
      };

      // 3. Update Local Review List
      setReviews([newReview, ...reviews]);

      // 4. Update Local Product Rating (Visual Update Only)
      // This makes the stars on the card update instantly without touching the database!
      const newTotalReviews = reviews.length + 1;
      const oldRating = currentProduct.rating || 0;
      // Approximate new average
      const newAverage = ((oldRating * reviews.length) + userRating) / newTotalReviews;

      // Update the products array locally
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === currentProduct.id ? { ...p, rating: newAverage } : p
        )
      );

      // Cleanup
      setUserComment("");
      setUserRating(0);
      setSubmittingReview(false);
      
      // Optional: Show simple alert
      // alert("Review submitted successfully!");
    }, 800);
  };

  // ------------------- HANDLERS -------------------
  const openReviews = (product) => {
    setCurrentProduct(product);
    setShowReviewModal(true);
    
    // ⭐ Load Mock Data mixed with any local state logic if needed
    // For now, we just reset to the mock list every time we open a new product
    // so it doesn't look empty.
    setReviews([...MOCK_REVIEWS]); 
    
    setUserRating(0);
    setUserComment("");
  };

  const closeReviews = () => {
    setShowReviewModal(false);
    setCurrentProduct(null);
  };

  // ------------------- STAR RENDER -------------------
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<StarFill key={`f-${i}`} />);
    if (halfStar) stars.push(<StarHalf key="h" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<Star key={`e-${i}`} />);
    return <div className="text-warning small">{stars}</div>;
  };

  // Star Input Helper
  const renderStarInput = () => {
    return (
      <div className="mb-3">
        <span className="me-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            onClick={() => setUserRating(star)}
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            className={star <= userRating ? "text-warning" : "text-secondary"}
          >
            {star <= userRating ? <StarFill /> : <Star />}
          </span>
        ))}
      </div>
    );
  };

  // ------------------- FILTER LOGIC -------------------
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <>
      {/* HERO */}
      <Container fluid className="p-5 mb-4 text-center text-white shadow-lg" style={{ background: "linear-gradient(45deg, hsla(136, 61%, 43%, 1), hsla(136, 61%, 51%, 1))" }}>
        <h1 className="display-3 fw-bold">All Products</h1>
        <p className="lead fs-4">Find exactly what you need.</p>
      </Container>

      {/* Search + Filter */}
      <Container className="mb-4">
        <Row className="g-3">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => cat && <option key={cat} value={cat}>{cat}</option>)}
            </Form.Select>
          </Col>
        </Row>
      </Container>

      {/* PRODUCTS GRID */}
      <Container className="my-5">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center fs-4 mt-4">No products found.</p>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product) => {
              const price = Number(product.price) || 0;
              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock <= 0;

              return (
                <Col md={6} lg={4} key={product.id}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Img
                      variant="top"
                      src={product.imageUrl || "https://placehold.co/600x400/eee/aaa?text=No+Image"}
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold">{product.name}</Card.Title>
                      <Card.Text className="text-muted text-truncate">
                        {product.description}
                      </Card.Text>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-success fw-bold mb-0">${price.toFixed(2)}</h4>
                        <div 
                          onClick={() => openReviews(product)} 
                          style={{cursor: 'pointer'}} 
                          title="View Reviews"
                        >
                           {renderStars(product.rating)}
                           <small className="text-muted ms-1" style={{fontSize: '0.8rem'}}>
                             (View)
                           </small>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-auto">
                        <Button
                            variant={isOutOfStock ? "secondary" : "primary"}
                            className="flex-grow-1"
                            onClick={() => handleAddToCart(product)}
                            disabled={adding === product.id || isOutOfStock}
                        >
                            {isOutOfStock ? "Out of Stock" : adding === product.id ? "Adding..." : "Add to Cart"}
                        </Button>
                        <Button variant="outline-secondary" onClick={() => openReviews(product)}>
                            <ChatLeftText />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* ⭐ REVIEW MODAL (UI ONLY - NO FIREBASE SAVE) ⭐ */}
      <Modal show={showReviewModal} onHide={closeReviews} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reviews: {currentProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* 1. LIST FAKE REVIEWS */}
          <h5 className="mb-3">Customer Feedback</h5>
          <div className="mb-4">
              {reviews.map((review) => (
                <Card key={review.id} className="mb-2 border-0 bg-light">
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between">
                      <strong>{review.userName}</strong>
                      {renderStars(review.rating)}
                    </div>
                    <p className="mb-0 mt-1">{review.comment}</p>
                    <small className="text-muted">
                      {review.date.toLocaleDateString()}
                    </small>
                  </Card.Body>
                </Card>
              ))}
          </div>

          <hr />

          {/* 2. ADD REVIEW FORM (LOCAL STATE ONLY) */}
          <h5>Write a Review</h5>
          <Form onSubmit={handleSubmitReview}>
             {renderStarInput()}
             
             <FloatingLabel controlId="reviewText" label="Share your thoughts..." className="mb-3">
               <Form.Control
                 as="textarea"
                 placeholder="Leave a comment here"
                 style={{ height: '100px' }}
                 value={userComment}
                 onChange={(e) => setUserComment(e.target.value)}
                 required
               />
             </FloatingLabel>

             <div className="d-grid">
               <Button type="submit" variant="success" disabled={submittingReview}>
                 {submittingReview ? "Posting..." : "Submit Review"}
               </Button>
             </div>
          </Form>

        </Modal.Body>
      </Modal>
    </>
  );
}