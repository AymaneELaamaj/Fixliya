import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * 1. Récupérer "MA JOURNÉE"
 * On cherche les tickets où le champ 'assignedTo' est égal à mon Nom.
 */
export const getMyMissions = async (artisanId) => { // On attend un ID maintenant
  try {
    const q = query(
      collection(db, "tickets"), 
      where("assignedToId", "==", artisanId), // <--- On filtre sur le nouveau champ ID
      where("status", "==", "pris_en_charge")
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
 * 2. Terminer une intervention
 * L'artisan signale qu'il a fini.
 */
export const completeMission = async (ticketId) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    await updateDoc(ticketRef, {
      status: "termine_artisan", // Statut intermédiaire avant validation étudiante
      dateFin: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur Clôture:", error);
    throw error;
  }
};