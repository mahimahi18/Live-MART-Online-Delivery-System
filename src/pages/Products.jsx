import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
// KEPT YOUR EXACT IMPORTS + updateDoc for the Stock Generator
import { 
  collection, 
  onSnapshot, 
  doc, 
  runTransaction,
  updateDoc 
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
import Badge from 'react-bootstrap/Badge';

// Icons
import { StarFill, StarHalf, Star, ChatLeftText, Gear } from 'react-bootstrap-icons';

// ⭐ FAKE DATA GENERATOR
const MOCK_REVIEWS = [
  { id: 101, userName: "Alice M.", rating: 5, comment: "Absolutely love this! Great quality.", date: new Date() },
  { id: 102, userName: "John D.", rating: 4, comment: "Good value for money, fast shipping.", date: new Date() },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null);
  const [generatingStock, setGeneratingStock] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ⭐ REVIEWS STATE
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();

  // ------------------- FETCH PRODUCTS -------------------
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

  // ------------------- 🛠️ STOCK GENERATOR (ONE TIME USE) -------------------
  const handleGenerateStock = async () => {
    if(!window.confirm("This will give every product a random stock count (0-20). Continue?")) return;
    
    setGeneratingStock(true);
    try {
      // We loop through loaded products and update them one by one
      // This uses your existing 'db' connection
      const updates = products.map(product => {
        const randomStock = Math.floor(Math.random() * 21); // Random 0 to 20
        const productRef = doc(db, "products", product.id);
        return updateDoc(productRef, { stock: randomStock });
      });

      await Promise.all(updates);
      alert("Success! All products now have random stock.");
    } catch (error) {
      console.error("Error generating stock:", error);
      alert("Failed to update stock.");
    } finally {
      setGeneratingStock(false);
    }
  };

  // ------------------- ADD TO CART -------------------
  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      setAdding(null);
      return;
    }

    // Check stock before adding (Client side check)
    if (product.stock && product.stock <= 0) {
        alert("Item is out of stock!");
        setAdding(null);
        return;
    }

    const cartItemRef = doc(db, "users", user.uid, "cart", product.id);

    try {
      await runTransaction(db, async (transaction) => {
        const cartDoc = await transaction.get(cartItemRef);
        if (cartDoc.exists()) {
          const newQuantity = cartDoc.data().quantity + 1;
          // Optional: Check if we are exceeding stock limit
          if (product.stock && newQuantity > product.stock) {
              throw new Error("OUT_OF_STOCK");
          }
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
      if (err.message === "OUT_OF_STOCK") {
          alert("You cannot add more than the available stock.");
      } else {
          alert("Error adding to cart.");
      }
    } finally {
      setAdding(null);
    }
  };

  // ------------------- REVIEW HANDLERS -------------------
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (userRating === 0) { alert("Please select a star rating."); return; }
    setSubmittingReview(true);

    setTimeout(() => {
      const user = auth.currentUser;
      const newReview = {
        id: Date.now(),
        userName: user ? (user.displayName || user.email) : "Guest User",
        rating: userRating,
        comment: userComment,
        date: new Date()
      };
      setReviews([newReview, ...reviews]);
      const newTotalReviews = reviews.length + 1;
      const oldRating = currentProduct.rating || 0;
      const newAverage = ((oldRating * reviews.length) + userRating) / newTotalReviews;

      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === currentProduct.id ? { ...p, rating: newAverage } : p
        )
      );

      setUserComment("");
      setUserRating(0);
      setSubmittingReview(false);
    }, 800);
  };

  const openReviews = (product) => {
    setCurrentProduct(product);
    setShowReviewModal(true);
    setReviews([...MOCK_REVIEWS]); 
    setUserRating(0);
    setUserComment("");
  };

  const closeReviews = () => {
    setShowReviewModal(false);
    setCurrentProduct(null);
  };

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
              
              // ⭐ NEW: STOCK LOGIC
              // If stock is undefined, default to 0 so it shows "Out of Stock"
              const stock = product.stock !== undefined ? Number(product.stock) : 0;
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

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4 className="text-success fw-bold mb-0">${price.toFixed(2)}</h4>
                        <div onClick={() => openReviews(product)} style={{cursor: 'pointer'}}>
                           {renderStars(product.rating)}
                           <small className="text-muted ms-1">(View)</small>
                        </div>
                      </div>

                      {/* ⭐ STOCK BADGE */}
                      <div className="mb-3">
                        {isOutOfStock ? (
                          <Badge bg="danger">Out of Stock</Badge>
                        ) : (
                          <Badge bg="success">In Stock: {stock}</Badge>
                        )}
                      </div>

                      <div className="d-flex gap-2 mt-auto">
                        <Button
                            // ⭐ DISABLE BUTTON IF OUT OF STOCK
                            variant={isOutOfStock ? "secondary" : "primary"}
                            className="flex-grow-1"
                            onClick={() => handleAddToCart(product)}
                            disabled={adding === product.id || isOutOfStock}
                        >
                            {isOutOfStock ? "Sold Out" : adding === product.id ? "Adding..." : "Add to Cart"}
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

      {/* ⭐ ADMIN SECTION (For Testing) */}
      <Container className="py-5 text-center">
         <hr className="mb-4"/>
         <p className="text-muted small">Admin Tools (For Demo Only)</p>
         <Button 
           variant="outline-dark" 
           size="sm" 
           onClick={handleGenerateStock} 
           disabled={generatingStock}
         >
           <Gear className="me-1"/> 
           {generatingStock ? "Generating..." : "Generate Random Stock (0-20)"}
         </Button>
      </Container>

      {/* REVIEWS MODAL */}
      <Modal show={showReviewModal} onHide={closeReviews} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reviews: {currentProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                    <small className="text-muted">{review.date.toLocaleDateString()}</small>
                  </Card.Body>
                </Card>
              ))}
          </div>
          <hr />
          <h5>Write a Review</h5>
          <Form onSubmit={handleSubmitReview}>
             {renderStarInput()}
             <FloatingLabel controlId="reviewText" label="Share your thoughts..." className="mb-3">
               <Form.Control
                 as="textarea"
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