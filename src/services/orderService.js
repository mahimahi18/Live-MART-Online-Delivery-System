import { 
    collection, 
    doc, 
    updateDoc, 
    getDocs, 
    query, 
    where,
    getFunctions,
    httpsCallable 
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  // Get a reference to the Cloud Functions
  const functions = getFunctions(app); // Assumes 'app' is your exported firebase app
  
  // --- Customer Functions ---
  
  /**
   * (Customer) Calls the 'placeOrder' Cloud Function.
   * This is the ONLY way to create an order.
   * @param {object} orderDetails - { cart, deliveryAddress, paymentMode }
   */
  export const placeOrder = httpsCallable(functions, 'placeOrder');
  // The frontend will call this like:
  // placeOrder({ cart: [...], deliveryAddress: "..." })
  //   .then((result) => console.log(result.data.orderId))
  //   .catch((error) => console.error(error.message));
  
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