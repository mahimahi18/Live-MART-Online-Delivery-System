// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCujtmAdVzL4m7NuXdmAawKXpYTX9XizVM",
  authDomain: "live-mart-454d5.firebaseapp.com",
  projectId: "live-mart-454d5",
  storageBucket: "live-mart-454d5.firebasestorage.app",
  messagingSenderId: "160588146255",
  appId: "1:160588146255:web:46afadd2e3f8386d9a6c3a"
};

const app = initializeApp(firebaseConfig);
export default app;