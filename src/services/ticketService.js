// src/services/ticketService.js
import { db, storage } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export const getStudentTickets = async (studentId) => {
  try {
    const q = query(
      collection(db, "tickets"), 
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);
    
    // Transformation des données (Mapping)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    throw error;
  }
};



/**
 * 2. Créer un ticket avec Image (Écriture Complexe)
 */


// Note : J'ai retiré les imports de Storage

/**
 * Crée un ticket (Version temporaire SANS image)
 */
export const createTicket = async (ticketData) => {
  try {
    // On saute l'étape d'upload pour l'instant

    // 2. Préparation de l'objet Ticket
    const newTicket = {
      studentId: ticketData.studentId, 
      studentName: ticketData.studentName,
      location: ticketData.location, 
      category: ticketData.category, // Plomberie, Elec, etc. [cite: 22]
      description: ticketData.description,
      
      // PLACEHOLDER : On met une fausse image pour l'instant
      imageUrl: "https://placehold.co/600x400?text=Image+Non+Disponible", 
      
      isUrgent: ticketData.isUrgent, // [cite: 24]
      status: "pending", // "En attente" [cite: 28]
      createdAt: new Date().toISOString()
    };

    // 3. Sauvegarde dans Firestore
    await addDoc(collection(db, "tickets"), newTicket);
    return true;

  } catch (error) {
    console.error("Erreur création ticket:", error);
    throw error;
  }
};


// On ajoutera createTicket ici plus tard