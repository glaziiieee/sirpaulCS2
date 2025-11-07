// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUQPQ0V-QrDcog2GStQiCXCGUxYbjKFY4",
  authDomain: "filipinoemigrantsdb-99259.firebaseapp.com",
  projectId: "filipinoemigrantsdb-99259",
  storageBucket: "filipinoemigrantsdb-99259.firebasestorage.app",
  messagingSenderId: "481495525361",
  appId: "1:481495525361:web:0b41117f72658daec94650"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);

// Initialize Firebase Auth and attempt anonymous sign-in.
// Some Firestore rules require request.auth != null; anonymous
// auth is a safe way to get an authenticated context for read-only
// clients during development.
export const auth = getAuth(app);
signInAnonymously(auth)
  .then((credential) => {
    console.log("Anonymous sign-in successful. uid:", credential?.user?.uid);
  })
  .catch((err) => {
    // Log but don't throw — the app should still work if rules allow public reads.
    console.warn("Anonymous sign-in failed:", err?.code || err?.message || err);
  });

// Log auth state changes for easier debugging
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Auth state: signed in (uid):", user.uid);
  } else {
    console.log("Auth state: signed out");
  }
});
