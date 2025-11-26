import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * 1. Récupérer "MA JOURNÉE"
 * On cherche les tickets où assignedToId est égal à mon ID.
 */
export const getMyMissions = async (artisanId) => {
  try {
    const q = query(
      collection(db, "tickets"), 
      where("assignedToId", "==", artisanId),
      where("status", "==", "in_progress")
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur Artisan:", error);
    throw error;
  }
};

/**
 * 2. Terminer une intervention avec preuve photos
 * L'artisan doit fournir les photos avant/après
 * Envoie une notification à l'étudiant pour validation
 */
export const completeMission = async (ticketId, proofData) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    // Récupérer les détails du ticket pour obtenir l'email de l'étudiant
    const ticketSnap = await getDocs(query(collection(db, "tickets"), where("__name__", "==", ticketId)));
    
    await updateDoc(ticketRef, {
      status: "termine_artisan",
      dateFin: new Date().toISOString(),
      beforePhoto: proofData.beforePhoto,
      afterPhoto: proofData.afterPhoto,
      completedAt: proofData.completedAt
    });

    // TODO: Envoyer notification à l'étudiant via email ou push notification
    // L'étudiant devra valider l'intervention et laisser un avis
    
  } catch (error) {
    console.error("Erreur Clôture:", error);
    throw error;
  }
};

/**
 * Récupérer l'historique (Tickets validés avec notes)
 */
export const getArtisanHistory = async (artisanId) => {
  try {
    const q = query(
      collection(db, "tickets"), 
      where("assignedToId", "==", artisanId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur Historique:", error);
    return [];
  }
};