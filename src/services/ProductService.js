import app from "../firebase";
import { 
  getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);

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
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    retailerId: user.uid, // tie to retailer
    createdAt: new Date(),
  });
  return docRef.id;
};

// ✅ Update existing product (used in ProductForm edit mode)
export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, "products", productId);
  await updateDoc(docRef, updatedData);
};

// ✅ Delete a product (used in RetailerDashboard)
export const deleteProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

// ✅ Get products belonging to current retailer
export const getMyProducts = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const q = query(collection(db, "products"), where("retailerId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

