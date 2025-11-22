import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
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
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Badge from 'react-bootstrap/Badge';

// Icons
import { StarFill, StarHalf, Star, GeoAltFill } from 'react-bootstrap-icons';

// ⭐ 1. STATIC DEMO PRODUCTS
const DEMO_PRODUCTS = [
  { 
    id: "static-1", 
    name: "Sony WH-1000XM5", 
    price: 348.00, 
    category: "Electronics", 
    lat: 40.7138, lng: -74.0070, 
    stock: 12, 
    rating: 4.8, 
    description: "Industry leading noise canceling headphones.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "static-2",
    name: "Ethiopian Coffee Beans", 
    price: 18.50, 
    category: "Groceries", 
    lat: 40.7580, lng: -73.9855, 
    stock: 45, 
    rating: 5, 
    description: "Freshly roasted, fair trade, aromatic.",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "static-3",
    name: "Nike Air Zoom Pegasus", 
    price: 120.00, 
    category: "Fashion", 
    lat: 40.8000, lng: -74.1000, 
    stock: 8, 
    rating: 4.2, 
    description: "Lightweight running shoes for daily training.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "static-4",
    name: "Canon EOS R6 Camera", 
    price: 2499.00, 
    category: "Electronics", 
    lat: 40.7120, lng: -74.0050, 
    stock: 2, 
    rating: 4.9, 
    description: "Professional mirrorless camera kit.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "static-5",
    name: "Leather Watch", 
    price: 85.00, 
    category: "Fashion", 
    lat: 40.7549, lng: -73.9840, 
    stock: 20, 
    rating: 3.9, 
    description: "Minimalist design with genuine leather strap.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "static-6",
    name: "Gaming Monitor (Out of Stock)", 
    price: 450.00, 
    category: "Electronics", 
    lat: 40.8200, lng: -74.2000, 
    stock: 0, 
    rating: 4.5, 
    description: "34-inch ultrawide display, 144Hz refresh rate.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"
  },
];

// ⭐ 2. FALLBACK IMAGES
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", 
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600", 
    "https://images.unsplash.com/photo-1618423930487-a58d48303845?w=600",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600"
];

// ⭐ MOCK REVIEWS
const MOCK_REVIEWS = [
  { id: 101, userName: "Alice M.", rating: 5, comment: "Absolutely love this! Great quality.", date: new Date() },
  { id: 102, userName: "John D.", rating: 4, comment: "Good value for money, fast shipping.", date: new Date() },
  { id: 103, userName: "Sarah W.", rating: 5, comment: "Exactly what I needed.", date: new Date() },
];

// ⭐ USER LOCATION
const USER_COORDS = { lat: 40.7128, lng: -74.0060 }; 

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rangeOption, setRangeOption] = useState("any"); // Changed state name for clarity
  const [sortOrder, setSortOrder] = useState(""); 

  // Reviews
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();

  // Helper: Distance
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999; 
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  // ------------------- FETCH + MERGE -------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        // Process DB & Fallback Images
        const dbProducts = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            
            // Manually assign images if the name matches specific products
            if (data.name === "Test Apple") {
                data.imageUrl = "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80";
            } 
            else if (data.name === "Organic Rice") {
                data.imageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
            }
            // Otherwise use DB image or fallback
            else if(!data.imageUrl) {
                data.imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            }
            
            return { id: doc.id, ...data };
        });

        // Merge DB + Demo
        const allProducts = [...dbProducts, ...DEMO_PRODUCTS].map(p => ({
            ...p,
            distance: getDistance(USER_COORDS.lat, USER_COORDS.lng, p.lat, p.lng)
        }));

        setProducts(allProducts);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching DB products: ", err);
        const demoWithDist = DEMO_PRODUCTS.map(p => ({
            ...p,
            distance: getDistance(USER_COORDS.lat, USER_COORDS.lng, p.lat, p.lng)
        }));
        setProducts(demoWithDist);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ------------------- CART -------------------
  const handleAddToCart = async (product) => {
    setAdding(product.id);
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      setAdding(null);
      return;
    }

    if (product.stock !== undefined && product.stock <= 0) {
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
      alert("Error adding to cart. Make sure you are logged in.");
    } finally {
      setAdding(null);
    }
  };

  // ------------------- REVIEWS -------------------
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (userRating === 0) return;
    setSubmittingReview(true);
    setTimeout(() => {
      setSubmittingReview(false);
      closeReviews();
      alert("Review posted!");
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

  const renderStarInput = () => (
    <div className="mb-3">
        <span className="me-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} onClick={() => setUserRating(star)} style={{ cursor: 'pointer', fontSize: '1.5rem' }} className={star <= userRating ? "text-warning" : "text-secondary"}>
            {star <= userRating ? <StarFill /> : <Star />}
          </span>
        ))}
    </div>
  );

  // ------------------- FILTERS -------------------
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  // ⭐ UPDATE: Range Filter Logic
  let filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
    
    let matchesDistance = true;
    if (rangeOption !== "any") {
        if (p.distance >= 9999) {
            matchesDistance = false;
        } else {
            if (rangeOption === "0-5") {
                matchesDistance = p.distance <= 5;
            } else if (rangeOption === "5-20") {
                // Ranges from 5km up to 20km
                matchesDistance = p.distance > 5 && p.distance <= 20;
            }
        }
    }

    return matchesSearch && matchesCategory && matchesDistance;
  });

  if (sortOrder === "low-high") {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOrder === "high-low") {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  const clearFilters = () => {
    setSearchTerm(""); setSelectedCategory(""); setRangeOption("any"); setSortOrder("");
  }

  return (
    <>
      {/* HERO SECTION */}
      <Container 
        fluid 
        className="p-5 mb-4 text-center text-white shadow-sm"
        style={{ backgroundColor: '#28a745' }} 
      >
        <h1 className="display-3 fw-bold">All Products</h1>
        <p className="lead fs-4">Fresh. Fast. Local.</p>
      </Container>

      {/* FILTER BAR */}
      <Container className="mb-4">
        <Card className="p-4 border-0 shadow-sm bg-white rounded-3">
            <Row className="g-3">
              <Col md={12} lg={4}>
                  <FloatingLabel controlId="search" label="Search products...">
                      <Form.Control type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </FloatingLabel>
              </Col>
              <Col md={6} lg={3}>
                  <FloatingLabel controlId="cat" label="Category">
                    <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All</option>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>
                  </FloatingLabel>
              </Col>

              {/* ⭐ UPDATE: Distance Dropdown */}
              <Col md={6} lg={3}>
                  <FloatingLabel controlId="dist" label="Radius (Distance)">
                    <Form.Select value={rangeOption} onChange={(e) => setRangeOption(e.target.value)}>
                        <option value="any">Any Distance</option>
                        <option value="0-5">0 - 5 km</option>
                        <option value="5-20">5 - 20 km</option>
                    </Form.Select>
                  </FloatingLabel>
              </Col>

              <Col md={6} lg={2}>
                  <FloatingLabel controlId="sort" label="Sort Price">
                    <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="">Default</option>
                        <option value="low-high">Low to High</option>
                        <option value="high-low">High to Low</option>
                    </Form.Select>
                  </FloatingLabel>
              </Col>
            </Row>
        </Card>
      </Container>

      {/* PRODUCTS GRID */}
      <Container className="my-5">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5">
             <p className="fs-4 text-muted">No products found matching your filters.</p>
             <Button variant="outline-primary" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product) => {
              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock <= 0;
              const distDisplay = product.distance < 100 ? `${product.distance.toFixed(1)} km` : '';

              return (
                <Col md={6} lg={4} key={product.id}>
                  <Card className="shadow-sm border-0 h-100 product-card">
                    <div style={{ position: 'relative' }}>
                      <Card.Img
                        variant="top"
                        src={product.imageUrl || "https://placehold.co/600x400/eee/aaa?text=No+Image"}
                        alt={product.name}
                        style={{ height: "220px", objectFit: "cover", filter: isOutOfStock ? "grayscale(100%)" : "none" }}
                      />
                      
                      {distDisplay && (
                         <Badge bg="light" text="dark" className="position-absolute top-0 end-0 m-2 shadow-sm d-flex align-items-center gap-1">
                           <GeoAltFill className="text-danger"/> {distDisplay} away
                         </Badge>
                      )}
                    </div>
                    
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold text-truncate" title={product.name}>{product.name}</Card.Title>
                      
                      <Card.Text className="text-muted small text-truncate mb-2">
                        {product.description}
                      </Card.Text>

                      <div className="mb-3 d-flex align-items-center">
                        <div style={{cursor: 'pointer'}} onClick={() => openReviews(product)}>
                           {renderStars(product.rating)}
                        </div>
                        <small className="text-muted ms-2">({Math.floor(Math.random() * 50) + 10})</small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-end mb-3 mt-auto">
                        <div>
                           <h4 className="text-success fw-bold mb-0">${Number(product.price).toFixed(2)}</h4>
                        </div>
                        <div className="text-end">
                           <Badge bg={isOutOfStock ? "danger" : "success"}>
                             {isOutOfStock ? "Out of Stock" : `In Stock: ${stock}`}
                           </Badge>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <Button
                            variant={isOutOfStock ? "secondary" : "primary"}
                            onClick={() => handleAddToCart(product)}
                            disabled={adding === product.id || isOutOfStock}
                        >
                            {adding === product.id ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Cart"}
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

      {/* REVIEWS MODAL */}
      <Modal show={showReviewModal} onHide={closeReviews} centered>
        <Modal.Header closeButton><Modal.Title>Reviews: {currentProduct?.name}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="mb-4">
          {reviews.map(r => (
            <div key={r.id} className="mb-3 border-bottom pb-2">
              <div className="d-flex justify-content-between"><strong>{r.userName}</strong> {renderStars(r.rating)}</div>
              <p className="mb-0 small text-muted">{r.comment}</p>
            </div>
          ))}
          </div>
          <hr />
          <Form onSubmit={handleSubmitReview}>
             <p className="fw-bold mb-2">Write a Review</p>
             {renderStarInput()}
             <FloatingLabel label="Share your thoughts..."><Form.Control as="textarea" style={{height:'80px'}} onChange={e => setUserComment(e.target.value)}/></FloatingLabel>
             <Button type="submit" variant="success" size="sm" className="mt-2 w-100" disabled={submittingReview}>Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}