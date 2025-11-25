// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// [NORME] Toutes les actions Auth passent par ici

/**
 * Inscription complète (Auth + Firestore Profile)
 */
export const registerUser = async (userData) => {
  // 1. Créer le compte Auth
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;

  // 2. Créer le profil Firestore
  // On prépare l'objet à sauvegarder (sans le mot de passe !)
  const userProfile = {
    uid: user.uid,
    prenom: userData.prenom,
    nom: userData.nom,
    email: userData.email,
    pavillon: userData.pavillon,
    chambre: userData.chambre,
    role: "student", // Rôle par défaut
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", user.uid), userProfile);
  
  return userProfile;
};

/**
 * Connexion simple
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Déconnexion
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Récupérer le profil complet (avec chambre, rôle...) depuis l'ID
 */
export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("Profil utilisateur introuvable");
  }
};