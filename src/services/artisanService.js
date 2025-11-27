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
    
    // N'envoyer que la photo APRÈS (pas la photo AVANT)
    // La photo AVANT reste locale chez l'artisan
    await updateDoc(ticketRef, {
      status: "termine_artisan",
      dateFin: new Date().toISOString(),
      afterPhoto: proofData.afterPhoto,  // Seulement la photo APRÈS
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
 * Récupérer l'historique (Tickets terminés: en attente de validation OU déjà validés avec notes)
 */
export const getArtisanHistory = async (artisanId) => {
  try {
    // Récupérer les tickets terminés par l'artisan (en attente de validation)
    const q1 = query(
      collection(db, "tickets"), 
      where("assignedToId", "==", artisanId),
      where("status", "==", "termine_artisan")
    );

    // Récupérer aussi les tickets validés et notés par l'étudiant
    const q2 = query(
      collection(db, "tickets"), 
      where("assignedToId", "==", artisanId),
      where("status", "==", "completed")
    );

    const snapshot1 = await getDocs(q1);
    const snapshot2 = await getDocs(q2);
    
    // Combiner les deux listes et les trier par date décroissante
    const allHistories = [
      ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];
    
    // Trier par date complétée (plus récente en premier)
    return allHistories.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.dateFin || 0);
      const dateB = new Date(b.completedAt || b.dateFin || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Erreur Historique:", error);
    return [];
  }
};