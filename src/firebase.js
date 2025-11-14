import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCujtmAdVzL4m7NuXdmAawKXpYTX9XizVM",
  authDomain: "live-mart-454d5.firebaseapp.com",
  projectId: "live-mart-454d5",
  storageBucket: "live-mart-454d5.firebasestorage.app",
  messagingSenderId: "160588146255",
  appId: "1:160588146255:web:46afadd2e3f8386d9a6c3a"
};

// Initialize all the services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Export them all for use in other files
export { app, db, auth, functions };