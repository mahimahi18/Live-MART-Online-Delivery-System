// This is your BACKEND file: live-mart/functions/index.js

// Import v2 functions
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize admin SDK
initializeApp();
const db = getFirestore();

// Set global options (e.g., region)
setGlobalOptions({ region: "us-central1" });

/**
 * A v2 callable Cloud Function to place an order and update stock.
 */
exports.placeOrder = onCall(async (request) => {
  // 1. Check for authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to place an order."
    );
  }

  const userId = request.auth.uid;
  // v2 uses request.data
  const { cart, deliveryAddress, paymentMode } = request.data; 

  if (!cart || cart.length === 0) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }

  try {
    let totalAmount = 0;
    const productRefs = []; // To store doc references for the transaction
    const productData = []; // To store clean data for the order document

    // 2. Get real product data from Firestore (prevents price tampering)
    for (const item of cart) {
      const productRef = db.collection("products").doc(item.productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        throw new HttpsError("not-found", `Product ${item.productId} not found.`);
      }

      const product = doc.data();
      
      // Check stock
      if (product.stock < item.quantity) {
        throw new HttpsError(
          "failed-precondition",
          `Not enough stock for ${product.name}.`
        );
      }
      
      // Calculate total securely on the server
      totalAmount += product.price * item.quantity;
      productRefs.push(productRef); // Store ref for transaction
      productData.push({ 
        productId: item.productId,
        quantity: item.quantity,
        name: product.name, 
        price: product.price 
      }); // Store full item data
    }

    // 3. Run a transaction to update stock and create the order
    const orderRef = await db.runTransaction(async (transaction) => {
      // A. Update stock for all products
      for (let i = 0; i < cart.length; i++) {
        const productRef = productRefs[i]; // The doc reference
        // Use v2/admin FieldValue
        const newStock = FieldValue.increment(-cart[i].quantity); 
        transaction.update(productRef, { stock: newStock });
      }

      // B. Create the new order document
      const newOrderRef = db.collection("orders").doc(); // Auto-generate an ID
      transaction.set(newOrderRef, {
        userId: userId,
        products: productData, // The array of {productId, quantity, name, price}
        totalAmount: totalAmount,
        status: "Pending",
        deliveryAddress: deliveryAddress,
        paymentMode: paymentMode,
        createdAt: FieldValue.serverTimestamp(), // Use v2/admin FieldValue
      });

      return newOrderRef; // Return the new order's ref
    });

    // 4. Return success to the client
    return { success: true, orderId: orderRef.id };

  } catch (error) {
    console.error("Transaction failed: ", error);
    if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError so client sees it
    }
    // Throw a generic error for anything else
    throw new HttpsError("unknown", error.message, error);
  }
});

