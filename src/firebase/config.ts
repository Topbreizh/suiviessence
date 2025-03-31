
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKOOSBfcs9zbpDW5rddPX2iO_UbhJ8ruc",
  authDomain: "achatessence.firebaseapp.com",
  projectId: "achatessence",
  storageBucket: "achatessence.firebasestorage.app",
  messagingSenderId: "281515354984",
  appId: "1:281515354984:web:82d95cead21432f56484dd",
  measurementId: "G-0GD4XVFQ7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
