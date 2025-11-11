// src/services/orderService.js
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Save an order to Firestore
export const placeOrder = async (orderData) => {
  try {
    await addDoc(collection(db, "orders"), orderData);
    console.log("✅ Order placed:", orderData);
  } catch (error) {
    console.error("❌ Error placing order:", error);
  }
};

// Get all orders (for a specific user or retailer)
export const getOrders = async (filter = {}) => {
  try {
    let q = collection(db, "orders");

    if (filter.userId) {
      q = query(q, where("userId", "==", filter.userId));
    } else if (filter.retailerId) {
      q = query(q, where("retailerId", "==", filter.retailerId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return [];
  }
};
