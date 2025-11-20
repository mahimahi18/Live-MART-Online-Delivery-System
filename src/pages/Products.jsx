import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, onSnapshot, doc, runTransaction } from 'firebase/firestore'; 
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

// Icons
import { StarFill, StarHalf, Star } from 'react-bootstrap-icons';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null);

  // ⭐ NEW STATES for search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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

  // ------------------- ADD TO CART -------------------
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
      alert("Error adding to cart. Please try again.");
    } finally {
      setAdding(null);
    }
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
    return <div className="text-warning">{stars}</div>;
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

  // Extract unique categories
  const categories = [...new Set(products.map((p) => p.category))];

  // ------------------- RENDER -------------------
  return (
    <>
      {/* HERO */}
      <Container
        fluid
        className="p-5 mb-4 text-center text-white shadow-lg"
        style={{
          background:
            "linear-gradient(45deg, hsla(136, 61%, 43%, 1), hsla(136, 61%, 51%, 1))",
        }}
      >
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
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) =>
                cat ? (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ) : null
              )}
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
                      src={
                        product.imageUrl ||
                        "https://placehold.co/600x400/eee/aaa?text=No+Image"
                      }
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold">{product.name}</Card.Title>
                      <Card.Text className="text-muted">
                        {product.description}
                      </Card.Text>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-success fw-bold mb-0">
                          ${price.toFixed(2)}
                        </h4>
                        {renderStars(product.rating)}
                      </div>

                      <Button
                        variant={isOutOfStock ? "secondary" : "primary"}
                        className="mt-auto w-100"
                        onClick={() => handleAddToCart(product)}
                        disabled={adding === product.id || isOutOfStock}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : adding === product.id
                          ? "Adding..."
                          : "Add to Cart"}
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
