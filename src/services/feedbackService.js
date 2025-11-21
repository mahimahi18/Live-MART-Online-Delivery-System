import { db, auth } from "../firebase";
import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

/**
 * Submits a new feedback/review for a product.
 * @param {object} data - { productId, rating, reviewText }
 */
export const submitFeedback = async (data) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to leave a review.");
  }

  try {
    await addDoc(collection(db, "feedback"), {
      productId: data.productId,
      rating: Number(data.rating),
      reviewText: data.reviewText,
      userId: user.uid,
      userName: user.displayName || user.email,  // For showing on UI
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback: ", error);
    return { success: false, error: error.message };
  }
};


/**
 * Fetches ALL feedback for a specific product.
 * @param {string} productId - Product ID
 */
export const getFeedbackForProduct = async (productId) => {
  const feedback = [];

  try {
    const q = query(
      collection(db, "feedback"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      feedback.push({ id: doc.id, ...doc.data() });
    });

    return feedback;
  } catch (error) {
    console.error("Error getting feedback: ", error);
    return [];
  }
};
