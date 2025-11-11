// src/services/productService.js
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return [];
  }
};
