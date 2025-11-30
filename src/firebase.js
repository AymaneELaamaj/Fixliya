import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"; 

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

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  }).catch(err => {
    console.log("Messaging non supporté :", err);
  });
}

// Fonction pour récupérer le Token (Avec Alerte Erreur)
export const requestForToken = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      alert("⚠️ Votre navigateur ne supporte pas les notifications (êtes-vous en navigation privée ou sur un vieil iPhone ?)");
      return null;
    }

    if (!messaging) messaging = getMessaging(app);

    const currentToken = await getToken(messaging, { 
      // Votre clé VAPID valide
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
    // C'EST L'ALERTE QUI VA VOUS AIDER :
    alert("❌ Erreur Permission : " + err.message + "\n\n(Essayez de réinitialiser les permissions du site en cliquant sur le cadenas dans la barre d'adresse)"); 
    return null;
  }
};

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