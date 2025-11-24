// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6lVQKgzj9HN2KqIP159qkG3Xd9N5lqiE",
  authDomain: "fixliya-app.firebaseapp.com",
  projectId: "fixliya-app",
  storageBucket: "fixliya-app.firebasestorage.app",
  messagingSenderId: "367638216734",
  appId: "1:367638216734:web:9f3afe3c4aabda1684ee0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export des outils
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);