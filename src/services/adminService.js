// src/services/adminService.js
import { db } from "../firebase";
import { collection, query, getDocs, doc, updateDoc, where, setDoc, deleteDoc } from "firebase/firestore";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Récupération dynamique de la config pour le "Ghost App"
let firebaseConfig;
try {
  firebaseConfig = getApp().options;
} catch (e) {
  console.error("Erreur config Firebase", e);
}

/**
 * 1. Récupérer TOUS les tickets (Tableau de Bord - Sec 3.1)
 * [cite: 36]
 */
export const getAllTickets = async () => {
  const q = query(collection(db, "tickets")); // Tri à ajouter plus tard si besoin
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 2. Assigner un ticket à un artisan (Dispatching - Sec 3.1)
 * [cite: 37]
 */
export const assignTicket = async (ticketId, artisanId, artisanName) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    assignedToId: artisanId,   // ID pour la requête côté artisan
    assignedToName: artisanName, // Nom pour l'affichage admin
    status: "in_progress"      // Passe de 'pending' à 'in_progress' [cite: 28]
  });
};

/**
 * 3. Récupérer la liste des artisans pour le menu déroulant
 */
export const getArtisans = async () => {
  const q = query(collection(db, "users"), where("role", "==", "artisan"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 4. Créer un Artisan sans déconnecter l'Admin (Gestion - Sec 3.2)
 * [cite: 43]
 */
export const createArtisanAccount = async (artisanData) => {
  let secondaryApp;
  try {
    const appName = "SecondaryApp" + Date.now(); // Nom unique
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    // Création sur l'instance secondaire
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      artisanData.email, 
      artisanData.password
    );
    const newUser = userCredential.user;

    // Écriture dans la base principale (db)
    await setDoc(doc(db, "users", newUser.uid), {
      prenom: artisanData.prenom,
      nom: artisanData.nom,
      email: artisanData.email,
      specialite: artisanData.specialite, // Ex: Plomberie
      role: "artisan",
      createdAt: new Date().toISOString()
    });

    await signOut(secondaryAuth); // Déconnexion du fantôme
  } catch (error) {
    throw error;
  } finally {
    if (secondaryApp) await deleteApp(secondaryApp); // Nettoyage
  }
};

/**
 * 5. Modifier un Artisan (Gestion - Sec 3.2)
 */
export const updateArtisan = async (artisanId, artisanData) => {
  const artisanRef = doc(db, "users", artisanId);
  await updateDoc(artisanRef, {
    prenom: artisanData.prenom,
    nom: artisanData.nom,
    email: artisanData.email,
    specialite: artisanData.specialite,
    updatedAt: new Date().toISOString()
  });
};

/**
 * 6. Supprimer un Artisan (Gestion - Sec 3.2)
 */
export const deleteArtisan = async (artisanId) => {
  await deleteDoc(doc(db, "users", artisanId));
};