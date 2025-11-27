import { db, storage } from "../firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export const getStudentTickets = async (studentId) => {
  try {
    const q = query(
      collection(db, "tickets"), 
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les tickets terminés par l'artisan et en attente de validation
 */
export const getTicketsAwaitingValidation = async (studentId) => {
  try {
    const q = query(
      collection(db, "tickets"), 
      where("studentId", "==", studentId),
      where("status", "==", "termine_artisan")
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Erreur récupération tickets terminés:", error);
    return [];
  }
};

/**
 * Valider et noter un ticket terminé
 * Photos avant/après incluses
 */
export const validateTicket = async (ticketId, rating, comment) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    await updateDoc(ticketRef, {
      status: "completed",
      rating: rating,
      studentComment: comment,
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur validation:", error);
    throw error;
  }
};

/**
 * Rejeter une intervention (demander des corrections)
 */
export const rejectTicket = async (ticketId, reason) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    await updateDoc(ticketRef, {
      status: "in_progress",
      rejectionReason: reason,
      rejectedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur rejet:", error);
    throw error;
  }
};

/**
 * Créer un ticket avec support des photos
 */
export const createTicket = async (ticketData) => {
  try {
    const newTicket = {
      studentId: ticketData.studentId, 
      studentName: ticketData.studentName,
      location: ticketData.location, 
      category: ticketData.category,
      description: ticketData.description,
      locationType: ticketData.locationType,
      building: ticketData.building,
      roomNumber: ticketData.roomNumber,
      commonAreaName: ticketData.commonAreaName,
      imageUrl: ticketData.imageUrl || "https://placehold.co/600x400?text=Image+Non+Disponible",
      audioUrl: ticketData.audioUrl || null,
      isUrgent: ticketData.isUrgent,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, "tickets"), newTicket);
    return true;

  } catch (error) {
    console.error("Erreur création ticket:", error);
    throw error;
  }
};

/**
 * Annuler un ticket (par l'étudiant)
 * Si le ticket est en attente, il peut être annulé sans notification
 * Si le ticket est assigné à un artisan, l'artisan est notifié de l'annulation
 */
export const cancelTicket = async (ticketId, reason = "") => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    
    await updateDoc(ticketRef, {
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      cancelledByStudent: true
    });
  } catch (error) {
    console.error("Erreur annulation ticket:", error);
    throw error;
  }
};