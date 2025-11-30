// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // AJOUT IMPORTANT

const firebaseConfig = {
  apiKey: "AIzaSyA6lVQKgzj9HN2KqIP159qkG3Xd9N5lqiE",
  authDomain: "fixliya-app.firebaseapp.com",
  projectId: "fixliya-app",
  storageBucket: "fixliya-app.firebasestorage.app",
  messagingSenderId: "367638216734",
  appId: "1:367638216734:web:9f3afe3c4aabda1684ee0f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app); // AJOUT IMPORTANT

// Fonction pour récupérer le "Numéro de téléphone numérique" (Token)
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      // ⚠️ ATTENTION : Vous devez générer cette clé dans la Console Firebase !
      // Paramètres du projet > Cloud Messaging > Configuration Web > Générer une paire de clés
      vapidKey: "BB2D09KkJPlD1MPKQw_zA-LAHjQw6d3dmMTD71n73RNKoRl2ek0kLbcrX99Pr0EYJGbseoE81pTA9yIfoFj_cZY" 
    });
    
    if (currentToken) {
      return currentToken;
    } else {
      console.log('Permission refusée ou pas de token.');
      return null;
    }
  } catch (err) {
    console.log('Erreur Token:', err);
    return null;
  }
};

// Fonction pour écouter quand l'app est ouverte
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });