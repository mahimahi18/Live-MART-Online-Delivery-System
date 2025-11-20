import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { addProduct, getProductById, updateProduct } from '../services/productService';
import './ProductForm.css';

function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(false);

  // ⭐ NEW STATE FIELDS
  const [isProxy, setIsProxy] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Load data when editing
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        const product = await getProductById(productId);
        if (product) {
          setName(product.name);
          setCategory(product.category);
          setPrice(product.price);
          setStock(product.stock);
          setImageURL(product.imageURL || '');

          // ⭐ Load new fields if they exist
          setIsProxy(product.isProxy || false);
          setLat(product.lat || '');
          setLng(product.lng || '');
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in!");
      setLoading(false);
      return;
    }

    // ⭐ Include new fields in product data
    const productData = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      imageURL,
      isProxy,
      lat: lat === '' ? null : Number(lat),
      lng: lng === '' ? null : Number(lng),
    };

    try {
      if (productId) {
        // UPDATE EXISTING PRODUCT
        await updateProduct(productId, productData);
        alert("Product updated successfully!");
      } else {
        // ADD NEW PRODUCT
        await addProduct(productData, user.uid, "Retailer");
        alert("Product added successfully!");
      }

      navigate('/retailer-dashboard');

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h1>{productId ? "Edit Product" : "Add New Product"}</h1>

        <label>Product Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />

        <label>Category</label>
        <input 
          type="text" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          required 
        />

        <label>Price</label>
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required 
        />

        <label>Stock</label>
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
          required 
        />

        <label>Image URL</label>
        <input 
          type="text" 
          value={imageURL} 
          onChange={(e) => setImageURL(e.target.value)} 
        />

        {/* ⭐ NEW FIELD — isProxy checkbox */}
        <label>
          <input 
            type="checkbox" 
            checked={isProxy} 
            onChange={(e) => setIsProxy(e.target.checked)} 
          />
          &nbsp;Is Proxy Product
        </label>

        {/* ⭐ NEW FIELDS — lat & lng */}
        <label>Latitude</label>
        <input
          type="number"
          step="0.000001"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />

        <label>Longitude</label>
        <input
          type="number"
          step="0.000001"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;

