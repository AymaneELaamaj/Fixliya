import { db } from "../firebase";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * 1. Récupérer TOUS les tickets (Vue Globale)
 * Contrairement à l'étudiant, on ne filtre pas par ID.
 */
export const getAllTickets = async () => {
  try {
    const q = query(collection(db, "tickets"));
    const snapshot = await getDocs(q);
    
    // On transforme le résultat en tableau propre
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur Admin:", error);
    throw error;
  }
};

/**
 * 2. Assigner un ticket à un artisan (Dispatching)
 * C'est l'action principale de l'Admin.
 */
export const assignTicket = async (ticketId, artisanName) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    // On met à jour le ticket dans la base
    await updateDoc(ticketRef, {
      assignedTo: artisanName,       // "Ahmed Plombier"
      status: "pris_en_charge"       // Le statut change automatiquement
    });
  } catch (error) {
    console.error("Erreur Assignation:", error);
    throw error;
  }
};