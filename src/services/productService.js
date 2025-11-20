import { 
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db, auth } from "../firebase"; 


// ----------------------------------------------------
// ✅ Get ALL products
// ----------------------------------------------------
export const getAllProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};


// ----------------------------------------------------
// ✅ Get product by ID
// ----------------------------------------------------
export const getProductById = async (productId) => {
  const docRef = doc(db, "products", productId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) throw new Error("Product not found");

  return { id: snap.id, ...snap.data() };
};


// ----------------------------------------------------
// ✅ ADD new product (with proxy, lat, lng)
// ----------------------------------------------------
export const addProduct = async (productData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const finalData = {
    ...productData,

    // New schema fields
    ownerId: user.uid,
    ownerRole: "Retailer",        // you can update later if you store role in user doc
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "products"), finalData);
  return docRef.id;
};


// ----------------------------------------------------
// ✅ UPDATE existing product
// ----------------------------------------------------
export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, "products", productId);

  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};


// ----------------------------------------------------
// ✅ DELETE product
// ----------------------------------------------------
export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, "products", productId));
};


// ----------------------------------------------------
// ✅ Get products belonging to current retailer
// ----------------------------------------------------
export const getMyProducts = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const q = query(collection(db, "products"), where("ownerId", "==", user.uid));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};


// ----------------------------------------------------
// ✅ Get products NEAR user (lat/lng + radius)
// ----------------------------------------------------
export const getProductsNearMe = async (center, radiusKm) => {
  const [userLat, userLng] = center;

  const querySnapshot = await getDocs(collection(db, "products"));
  const allProducts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filter only those with coordinates
  const withLocation = allProducts.filter(p => p.lat && p.lng);

  // Haversine distance function
  const toRad = (deg) => (deg * Math.PI) / 180;

  const distance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Only return products within radius
  return withLocation.filter((prod) => {
    const d = distance(userLat, userLng, prod.lat, prod.lng);
    return d <= radiusKm;
  });
};

