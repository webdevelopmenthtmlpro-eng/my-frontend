// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV7cTC6DPWERCQcYDviWCVsDWFwTLW8bk",
  authDomain: "swift-delivery-38345.firebaseapp.com",
  projectId: "swift-delivery-38345",
  storageBucket: "swift-delivery-38345.firebasestorage.app",
  messagingSenderId: "959515973555",
  appId: "1:959515973555:web:3e2e38ae84e962589cddc6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
