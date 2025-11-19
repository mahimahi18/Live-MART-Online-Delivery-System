// live-mart/functions/index.js

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
 * Cloud Function: placeOrder
 * Reads cart from Firestore, supports proxy/backorder items,
 * creates an order, and triggers a confirmation email.
 */
exports.placeOrder = onCall(async (request) => {
  // 1. Authentication check
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to place an order."
    );
  }

  const userId = request.auth.uid;
  const { deliveryAddress, paymentMode } = request.data; 

  // 2. Read user's cart from Firestore
  const cartRef = db.collection("users").doc(userId).collection("cart");
  const cartSnapshot = await cartRef.get();

  if (cartSnapshot.empty) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }

  try {
    let totalAmount = 0;
    const productRefs = [];
    const cartItemsToDelete = [];
    const productDataForOrder = [];

    // 3. Process each cart item
    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();
      const productId = cartDoc.id;
      const quantity = cartItem.quantity;
      const isProxy = cartItem.isProxy || false;

      const productRef = db.collection("products").doc(productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        throw new HttpsError("not-found", `Product ${productId} not found.`);
      }

      const product = doc.data();

      // Stock check & backorder logic
      let isBackorder = false;
      if (product.stock < quantity) {
        if (isProxy) {
          isBackorder = true; // Allow backorder for proxy items
        } else {
          throw new HttpsError(
            "failed-precondition",
            `Not enough stock for ${product.name}.`
          );
        }
      }

      totalAmount += product.price * quantity;
      productRefs.push(productRef);
      cartItemsToDelete.push(cartDoc.ref);

      productDataForOrder.push({
        productId,
        quantity,
        name: product.name,
        price: product.price,
        isBackorder,
        isProxy
      });
    }

    // 4. Run transaction (Stock update + Order Creation + Email Trigger + Cart Clear)
    const orderRef = await db.runTransaction(async (transaction) => {
      // A. Update stock
      for (let i = 0; i < productRefs.length; i++) {
        const productRef = productRefs[i];
        const qty = productDataForOrder[i].quantity;
        transaction.update(productRef, { stock: FieldValue.increment(-qty) });
      }

      // B. Create order document
      const newOrderRef = db.collection("orders").doc();
      transaction.set(newOrderRef, {
        userId,
        products: productDataForOrder,
        totalAmount,
        status: "Pending",
        deliveryAddress,
        paymentMode,
        createdAt: FieldValue.serverTimestamp(),
      });

      // --- NEW CODE: EMAIL TRIGGER ---
      
      // C. Create the email document for the extension to read
      const userEmail = request.auth.token.email; 
      // Fallback to email if name is missing
      const userName = request.auth.token.name || userEmail || "Customer"; 

      if (userEmail) {
        const emailRef = db.collection("mail").doc(); 
        transaction.set(emailRef, {
          to: [userEmail],
          template: {
            name: "orderConfirmation", // Ensure this template exists in your collection
            data: {
              orderId: newOrderRef.id,
              totalAmount: totalAmount.toFixed(2),
              name: userName,
            }
          }
        });
      }
      // --- END NEW CODE ---

      // D. Clear cart
      for (const itemRef of cartItemsToDelete) {
        transaction.delete(itemRef);
      }

      return newOrderRef;
    });

    return { success: true, orderId: orderRef.id };

  } catch (error) {
    console.error("Transaction failed: ", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("unknown", error.message, error);
  }
});