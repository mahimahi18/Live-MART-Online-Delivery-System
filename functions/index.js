// This is your BACKEND file: live-mart/functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize admin SDK
initializeApp();
const db = getFirestore();

// Set global options (e.g., region)
setGlobalOptions({ region: "us-central1" });

exports.placeOrder = onCall(async (request) => {
  // 1. Check for authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to place an order."
    );
  }

  const userId = request.auth.uid;
  // --- NEW LOGIC: Only get address/payment from request ---
  const { deliveryAddress, paymentMode } = request.data; 

  // Get the user's cart subcollection from the DATABASE
  const cartRef = db.collection("users").doc(userId).collection("cart");
  const cartSnapshot = await cartRef.get();

  if (cartSnapshot.empty) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }

  try {
    let totalAmount = 0;
    const productRefs = []; // To store product doc references
    const cartItemsToDelete = []; // To store cart doc refs to delete later
    const productDataForOrder = []; // To store clean data for the order document

    // 2. Loop through database cart items
    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();
      const productId = cartDoc.id; // The doc ID is the product ID
      const quantity = cartItem.quantity;
      const isProxy = cartItem.isProxy || false; // Check for proxy flag

      // Get real product data from Firestore
      const productRef = db.collection("products").doc(productId);
      const doc = await productRef.get();

      if (!doc.exists) {
        throw new HttpsError("not-found", `Product ${productId} not found.`);
      }

      const product = doc.data();
      
      // Check stock
      let isBackorder = false;
      if (product.stock < quantity) {
        if (isProxy) {
           // Allow if proxy
           isBackorder = true;
        } else {
           throw new HttpsError(
            "failed-precondition",
            `Not enough stock for ${product.name}.`
          );
        }
      }
      
      // Calculate total securely on the server
      totalAmount += product.price * quantity;
      
      productRefs.push(productRef);
      cartItemsToDelete.push(cartDoc.ref); // Add cart item ref to delete list

      productDataForOrder.push({ 
        productId: productId,
        quantity: quantity,
        name: product.name, 
        price: product.price,
        isBackorder: isBackorder
      });
    }

    // 3. Run a transaction
    const orderRef = await db.runTransaction(async (transaction) => {
      // A. Update stock for all products
      // We loop through our arrays which are in sync
      for (let i = 0; i < productRefs.length; i++) {
        const productRef = productRefs[i];
        const qty = productDataForOrder[i].quantity;
        const newStock = FieldValue.increment(-qty); 
        transaction.update(productRef, { stock: newStock });
      }

      // B. Create the new order document
      const newOrderRef = db.collection("orders").doc();
      transaction.set(newOrderRef, {
        userId: userId,
        products: productDataForOrder,
        totalAmount: totalAmount,
        status: "Pending",
        deliveryAddress: deliveryAddress,
        paymentMode: paymentMode,
        createdAt: FieldValue.serverTimestamp(),
      });

      // C. Delete the items from the user's cart
      for (const itemRef of cartItemsToDelete) {
        transaction.delete(itemRef);
      }

      return newOrderRef;
    });

    // 4. Return success
    return { success: true, orderId: orderRef.id };

  } catch (error) {
    console.error("Transaction failed: ", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("unknown", error.message, error);
  }
});