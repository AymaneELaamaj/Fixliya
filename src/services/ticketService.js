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
export const createTicket = async (ticketData, imageFile) => {
  try {
    let photoUrl = "";

    // A. Si l'étudiant a mis une photo, on l'upload d'abord dans Storage
    // if (imageFile) {
    //   // On crée un nom unique pour l'image (ex: tickets/12345_photo.jpg)
    //   const storageRef = ref(storage, `tickets/${Date.now()}_${imageFile.name}`);
      
    //   // On envoie le fichier
    //   const uploadResult = await uploadBytes(storageRef, imageFile);
      
    //   // On récupère l'URL publique (le lien http...)
    //   photoUrl = await getDownloadURL(uploadResult.ref);
    // }

    // B. On crée le document Ticket dans Firestore
    await addDoc(collection(db, "tickets"), {
      ...ticketData,        // Titre, description, catégorie...
      photoUrl: photoUrl,   // Le lien de l'image
      status: "en_attente",
      dateCreation: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur création ticket:", error);
    throw error;
  }
};


// On ajoutera createTicket ici plus tard