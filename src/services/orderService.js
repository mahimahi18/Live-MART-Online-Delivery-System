import { 
  collection, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
// 1. Import the db and functions from your main firebase.js file
import { db, functions } from "../firebase"; 
import { httpsCallable } from "firebase/functions";

// --- Customer Functions ---

/**
 * (Customer) Calls the 'placeOrder' Cloud Function.
 * This is the ONLY way to create an order.
 * @param {object} orderDetails - { cart, deliveryAddress, paymentMode }
 */
// 2. This now correctly points to your deployed Cloud Function
export const placeOrder = httpsCallable(functions, 'placeOrder');

/**
 * (Customer) Fetches all orders placed by a specific customer.
 * @param {string} userId - The UID of the logged-in customer.
 */
export const getMyOrders = async (userId) => {
  const orders = [];
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting my orders: ", error);
    return [];
  }
};

// --- Retailer / Wholesaler Functions ---

/**
 * (Retailer) Fetches all "Pending" orders.
 * A simple way to start. The frontend can then filter
 * these to show only orders relevant to this retailer.
 */
export const getPendingOrders = async () => {
  const orders = [];
  try {
    const q = query(collection(db, "orders"), where("status", "==", "Pending"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting pending orders: ", error);
    return [];
  }
};

/**
 * (Retailer) Updates the status of an order (e.g., "Pending" -> "Shipped").
 * @param {string} orderId - The ID of the order to update.
 * @param {string} newStatus - The new status string.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, "orders", orderId);
  try {
    await updateDoc(orderRef, { status: newStatus });
    return { success: true };
  } catch (error) {
    console.error("Error updating order status: ", error);
    return { success: false, error: error.message };
  }
};