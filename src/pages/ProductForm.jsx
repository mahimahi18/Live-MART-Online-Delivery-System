
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { addProduct, getProductById, updateProduct } from '../services/ProductService';
import './ProductForm.css'; // We'll create this file

function ProductForm() {
  // Get 'productId' from the URL (e.g., /edit-product/abc123)
  // If it's undefined, we are in "Add" mode.
  const { productId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we are in "Edit" mode
  useEffect(() => {
    if (productId) {
      console.log("Edit mode: fetching product", productId);
      const fetchProduct = async () => {
        const product = await getProductById(productId);
        if (product) {
          setName(product.name);
          setCategory(product.category);
          setPrice(product.price);
          setStock(product.stock);
          setImageURL(product.imageURL);
        }
      };
      fetchProduct();
    }
  }, [productId]); // Re-run if productId changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in!");
      setLoading(false);
      return;
    }

    const productData = { name, category, price: Number(price), stock: Number(stock), imageURL };

    try {
      if (productId) {
        // --- UPDATE (EDIT) LOGIC ---
        console.log("Updating product...");
        await updateProduct(productId, productData);
        alert("Product updated successfully!");
      } else {
        // --- ADD NEW LOGIC ---
        console.log("Adding new product...");
        // This assumes the user's role is stored in their Auth token or you fetch it
        // For now, we'll hardcode the role or get it from a user profile
        // Let's assume the user is a Retailer for this test
        await addProduct(productData, user.uid, "Retailer"); 
        alert("Product added successfully!");
      }
      navigate('/retailer-dashboard'); // Go back to dashboard on success
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
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />

        <label>Price</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <label>Stock</label>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />

        <label>Image URL</label>
        <input type="text" value={imageURL} onChange={(e) => setImageURL(e.target.value)} />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
