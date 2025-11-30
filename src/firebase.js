// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"; // Notez l'ajout de isSupported

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

// --- INITIALISATION SÉCURISÉE DU MESSAGING ---
let messaging = null;

// On vérifie d'abord si le navigateur supporte les notifications avant de l'activer
// Cela évite le crash "Unsupported Browser" sur les vieux iPhone ou navigateurs privés
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  }).catch(err => {
    console.log("Messaging non supporté sur cet appareil :", err);
  });
}

// Fonction pour récupérer le Token (Sécurisée)
export const requestForToken = async () => {
  try {
    // 1. Vérification de compatibilité
    const supported = await isSupported();
    if (!supported) {
      alert("Désolé, cet iPhone/Navigateur ne supporte pas les notifications Web. (iOS 16.4+ requis)");
      return null;
    }

    if (!messaging) messaging = getMessaging(app);

    // 2. Demande de permission
    const currentToken = await getToken(messaging, { 
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
    // Si l'erreur est liée aux permissions, on guide l'utilisateur
    if (err.message && err.message.includes("permission")) {
      alert("Permission refusée. Allez dans Réglages > FixLiya > Notifications pour autoriser.");
    }
    return null;
  }
};

// Fonction pour écouter les messages (Sécurisée)
export const onMessageListener = () =>
  new Promise((resolve) => {
    isSupported().then((supported) => {
      if (supported && messaging) {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }
    });
  });