import { 
  getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy, startAt, endAt 
} from "firebase/firestore";
import { db, auth } from "../firebase"; 

// --- NEW IMPORT ---
import { geohashForLocation, geohashQueryBounds, distanceBetween } from "geofire-common";
// --- END NEW IMPORT ---


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
  
  // --- NEW GEO-HASH LOGIC ---
  // The frontend form (ProductForm.jsx) must now provide 'lat' and 'lng'
  // If they are missing, we just don't save the geohash (optional location)
  let geohash = null;
  if (productData.lat && productData.lng) {
    geohash = geohashForLocation([productData.lat, productData.lng]);
  }
  // --- END NEW GEO-HASH LOGIC ---

  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    geohash: geohash, // Store the geohash
    // Ensure 'isProxy' is saved if present in productData
    isProxy: productData.isProxy || false, 
    ownerId: user.uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// ✅ Update existing product (used in ProductForm edit mode)
export const updateProduct = async (productId, updatedData) => {
  const docRef = doc(db, "products", productId);

  // --- NEW GEO-HASH LOGIC FOR UPDATES ---
  if (updatedData.lat && updatedData.lng) {
    updatedData.geohash = geohashForLocation([updatedData.lat, updatedData.lng]);
  }
  // --- END NEW GEO-HASH LOGIC ---

  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
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

  // Use 'ownerId' to match the field name in your Cloud Function
  const q = query(collection(db, "products"), where("ownerId", "==", user.uid)); 
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// --- NEW FUNCTION FOR MODULE 3 ---
/**
 * (Module 3) Fetches products within a given radius of a center point.
 * @param {Array<number>} center - The center point [latitude, longitude]
 * @param {number} radiusInKm - The radius in kilometers
 */
export const getProductsNearMe = async (center, radiusInKm) => {
  if (!center || !radiusInKm) return [];

  // 1. Calculate the geo-query bounds
  const radiusInM = radiusInKm * 1000;
  const bounds = geohashQueryBounds(center, radiusInM);
  
  const queries = [];
  // 2. Create a Firestore query for each bound
  for (const b of bounds) {
    const q = query(
      collection(db, "products"),
      orderBy("geohash"),
      startAt(b[0]),
      endAt(b[1])
    );
    queries.push(getDocs(q));
  }

  // 3. Execute all queries in parallel
  const snapshots = await Promise.all(queries);
  
  const matchingDocs = [];
  
  // 4. Filter the results (Geohash queries are approximate)
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      
      // We must manually check the distance for each doc
      // Only include if it has lat/lng
      if (data.lat && data.lng) {
        const distanceInKm = distanceBetween([data.lat, data.lng], center);
        if (distanceInKm <= radiusInKm) {
          matchingDocs.push({ id: doc.id, ...data });
        }
      }
    }
  }

  return matchingDocs;
};
// --- END NEW FUNCTION ---