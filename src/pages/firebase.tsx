// src/firebase.tsx
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtegnrx0Jk5LTnjhh3mKrEtjfjWY-D9IY",
  authDomain: "playfull-bistro.firebaseapp.com",
  projectId: "playfull-bistro",
  storageBucket: "playfull-bistro.appspot.com",
  messagingSenderId: "141066413083",
  appId: "1:141066413083:web:fa3440e8db79b9622844be",
  measurementId: "G-X2JC9SZ890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export Auth and Firestore instances
