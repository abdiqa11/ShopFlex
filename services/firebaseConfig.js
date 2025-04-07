// services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ add this

const firebaseConfig = {
  apiKey: "AIzaSyCHlQOeMY0I_8sPMOpbNHn0jcvRomMjXqQ",
  authDomain: "shopflex-5e1e2.firebaseapp.com",
  projectId: "shopflex-5e1e2",
  storageBucket: "shopflex-5e1e2.appspot.com",
  messagingSenderId: "681925401865",
  appId: "1:681925401865:web:2631c145079fc3d27087d8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app); // ✅ needed for Firestore

export { auth, db }; // ✅ export both
