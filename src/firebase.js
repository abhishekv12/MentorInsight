import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import GoogleAuthProvider
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCskghdKHQnPNFu1kuVCv5AWzLuyCWMsPA",
  authDomain: "mmmp-portal.firebaseapp.com",
  projectId: "mmmp-portal",
  storageBucket: "mmmp-portal.firebasestorage.app",
  messagingSenderId: "88807389520",
  appId: "1:88807389520:web:0f7be6a5844a39b1c39455",
  measurementId: "G-RYMMQ1KLDH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Export this!
export const db = getFirestore(app);