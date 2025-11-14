import app from "../firebase";
import { 
  getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);



// ✅ Place an order
export const placeOrder = async (orderData) => {
  try {
    await addDoc(collection(db, "orders"), orderData);
    console.log("✅ Order placed:", orderData);
  } catch (error) {
    console.error("❌ Error placing order:", error);
  }
};

// ✅ Get all orders (for customers, retailers, etc.)
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

// ✅ Get only pending orders (for retailer dashboard)
export const getPendingOrders = async (retailerId) => {
  try {
    const q = query(collection(db, "orders"), where("retailerId", "==", retailerId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error fetching pending orders:", error);
    return [];
  }
};

// ✅ Update order status (retailer action)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
    console.log(`✅ Order ${orderId} updated to ${status}`);
  } catch (error) {
    console.error("❌ Error updating order:", error);
  }
};

// ✅ Get current user's orders (for MyOrders.jsx)
export const getMyOrders = async (userId) => {
  return await getOrders({ userId });
};
