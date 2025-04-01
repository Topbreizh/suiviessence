
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKOOSBfcs9zbpDW5rddPX2iO_UbhJ8ruc",
  authDomain: "achatessence.firebaseapp.com",
  projectId: "achatessence",
  storageBucket: "achatessence.appspot.com", // Corrected from .firebasestorage.app
  messagingSenderId: "281515354984",
  appId: "1:281515354984:web:82d95cead21432f56484dd",
  measurementId: "G-0GD4XVFQ7E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
