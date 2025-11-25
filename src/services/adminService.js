import { db } from "../firebase";
import { collection, query, getDocs, doc, updateDoc, where, setDoc } from "firebase/firestore";

// Imports nécessaires pour l'App Fantôme (Secondary App)
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// On récupère la configuration de l'app principale pour créer le clone
// Assurez-vous que Firebase est bien initialisé dans ../firebase.js avant d'appeler ceci
let firebaseConfig;
try {
  firebaseConfig = getApp().options;
} catch (e) {
  console.error("Erreur: Impossible de récupérer la config Firebase. Vérifiez src/firebase.js");
}

/**
 * 1. Récupérer TOUS les tickets
 */
export const getAllTickets = async () => {
  try {
    const q = query(collection(db, "tickets"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur Admin:", error);
    throw error;
  }
};

/**
 * 2. Assigner un ticket
 */
export const assignTicket = async (ticketId, artisanId, artisanName) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      assignedToId: artisanId,
      assignedTo: artisanName,
      status: "pris_en_charge"
    });
  } catch (error) {
    console.error("Erreur Assignation:", error);
    throw error;
  }
};

/**
 * 3. Récupérer la liste des artisans
 */
export const getArtisans = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "artisan"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
};

/**
 * 4. CRÉER UN ARTISAN (App Fantôme)
 * Cette fonction crée un compte SANS déconnecter l'admin actuel.
 */
export const createArtisanAccount = async (artisanData) => {
  let secondaryApp;
  let secondaryAuth;

  try {
    console.log("👻 Démarrage de l'App Fantôme...");
    
    // A. On crée une 2ème instance de l'app Firebase
    secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    secondaryAuth = getAuth(secondaryApp);

    // B. On crée l'utilisateur sur l'app fantôme
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      artisanData.email, 
      artisanData.password
    );
    const newUser = userCredential.user;

    console.log("✅ Compte Auth créé pour :", newUser.email);

    // C. On écrit son profil dans Firestore (via l'app principale 'db')
    await setDoc(doc(db, "users", newUser.uid), {
      prenom: artisanData.prenom,
      nom: artisanData.nom,
      email: artisanData.email,
      specialite: artisanData.specialite,
      role: "artisan", 
      createdAt: new Date().toISOString()
    });

    // D. On déconnecte proprement le fantôme
    await signOut(secondaryAuth);

  } catch (error) {
    console.error("Erreur création artisan:", error);
    throw error;
  } finally {
    // E. On détruit l'app fantôme pour libérer la mémoire
    if (secondaryApp) {
      await deleteApp(secondaryApp);
      console.log("👻 App Fantôme détruite.");
    }
  }
};