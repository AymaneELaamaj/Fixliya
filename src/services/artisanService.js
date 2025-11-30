import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { createNotification, NOTIFICATION_TYPES } from "./notificationService";

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
 * Sauvegarder la photo AVANT intervention
 */
export const saveBeforePhoto = async (ticketId, beforePhotoUrl) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      beforePhotoUrl: beforePhotoUrl,
      interventionStartedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur sauvegarde photo avant:", error);
    throw error;
  }
};

/**
 * 2. Terminer une intervention avec preuve photos
 * L'artisan doit fournir les photos avant/après
 * Envoie une notification à l'étudiant ET à l'admin
 */
export const completeMission = async (ticketId, proofData) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    // Récupérer les infos du ticket pour obtenir le studentId
    const ticketSnap = await getDoc(ticketRef);
    
    if (!ticketSnap.exists()) {
      throw new Error("Ticket non trouvé");
    }
    
    const ticketData = ticketSnap.data();
    const studentId = ticketData.studentId;
    
    // Mettre à jour avec les photos et le statut
    const updateData = {
      status: "termine_artisan",
      dateFin: new Date().toISOString(),
      afterPhotoUrl: proofData.afterPhotoUrl,
      completedAt: proofData.completedAt
    };
    
    // Ajouter beforePhotoUrl si fourni
    if (proofData.beforePhotoUrl) {
      updateData.beforePhotoUrl = proofData.beforePhotoUrl;
    }
    
    await updateDoc(ticketRef, updateData);

    // Créer une notification pour l'étudiant
    if (studentId) {
      await createNotification(
        studentId,
        ticketId,
        NOTIFICATION_TYPES.COMPLETED,
        { artisanName: ticketData.assignedToName }
      );
    }
    
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