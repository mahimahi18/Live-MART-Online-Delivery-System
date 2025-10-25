// src/services/productService.js
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🧩 Collection ref
const productRef = collection(db, "products");

// CREATE — add a new product
export const addProduct = async (data) => {
  try {
    const docRef = await addDoc(productRef, data);
    console.log("✅ Product added with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error adding product:", err);
  }
};

// READ — get all products
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(productRef);
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("📦 Fetched products:", products);
    return products;
  } catch (err) {
    console.error("❌ Error fetching products:", err);
  }
};

// READ — get product by ID
export const getProductById = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("⚠️ No such product!");
      return null;
    }
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
  }
};

// UPDATE — modify a product
export const updateProduct = async (id, updatedData) => {
  try {
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, updatedData);
    console.log("🛠️ Product updated:", id);
  } catch (err) {
    console.error("❌ Error updating product:", err);
  }
};

// DELETE — remove a product
export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, "products", id));
    console.log("🗑️ Product deleted:", id);
  } catch (err) {
    console.error("❌ Error deleting product:", err);
  }
};
