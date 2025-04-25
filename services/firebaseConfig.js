import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHlQOeMY0I_8sPMOpbNHn0jcvRomMjXqQ",
  authDomain: "shopflex-5e1e2.firebaseapp.com",
  projectId: "shopflex-5e1e2",
  storageBucket: "shopflex-5e1e2.appspot.com",
  messagingSenderId: "681925401865",
  appId: "1:681925401865:web:2631c145079fc3d27087d8"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
// Using the correct storage bucket explicitly 
const storage = getStorage(app, "gs://shopflex-5e1e2.firebasestorage.app");

// Log for debugging purposes
console.log("Firebase Storage bucket configured:", storage.bucket);

export { auth, db, storage };
