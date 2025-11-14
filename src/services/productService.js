import { 
  getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore";
// --- FIX START ---
// Import the pre-initialized db and auth from firebase.js
import { db, auth } from "../firebase"; 
// We no longer need 'app' or 'getAuth' or 'getFirestore' here
// --- FIX END ---


// const db = getFirestore(app); // No longer needed
// const auth = getAuth(app); // No longer needed

// ✅ Get all products (used in Products page)
export const getAllProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get a product by ID (used in ProductForm editing)
export const getProductById = async (productId) => {
  const docRef = doc(db, "products", productId);
  const productSnap = await getDoc(docRef);
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() };
  } else {
    throw new Error("Product not found");
  }
};

// ✅ Add a new product (used in ProductForm)
export const addProduct = async (productData) => {
  const user = auth.currentUser; // 'auth' is now the direct import
  if (!user) throw new Error("User not authenticated");
  
  // Note: Your old code used 'retailerId', but your new
  // Cloud Function logic uses 'ownerId'. Let's use 'ownerId'
  // to be consistent with your secure backend.
  // We also get the user's role from their profile.
  // This function should really get the role from the 'users' doc.
  // For now, let's keep your logic, but 'ownerId' is better.
  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    ownerId: user.uid, // Changed to 'ownerId' for consistency
    // ownerRole: "Retailer", // You should fetch this!
    createdAt: serverTimestamp(), // Use serverTimestamp
  });
  return docRef.id;
};

// ✅ Update existing product (used in ProductForm edit mode)
export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, "products", productId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp() // Add this for consistency
  });
};

// ✅ Delete a product (used in RetailerDashboard)
export const deleteProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

// ✅ Get products belonging to current retailer
export const getMyProducts = async () => {
  const user = auth.currentUser; // 'auth' is now the direct import
  if (!user) throw new Error("User not authenticated");

  // Use 'ownerId' to match the field name in your Cloud Function
  const q = query(collection(db, "products"), where("ownerId", "==", user.uid)); 
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};