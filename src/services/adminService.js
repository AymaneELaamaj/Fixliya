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
      telephone: artisanData.telephone,
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
    telephone: artisanData.telephone,
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

/**
 * 7. Récupérer les statistiques pour les rapports
 */
export const getStatistics = async () => {
  const q = query(collection(db, "tickets"));
  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Interventions par mois
  const interventionsByMonth = {};
  tickets.forEach(ticket => {
    if (ticket.createdAt) {
      const date = new Date(ticket.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      interventionsByMonth[monthKey] = (interventionsByMonth[monthKey] || 0) + 1;
    }
  });

  // Temps moyen de réponse (en heures)
  const completedTickets = tickets.filter(t => t.status === 'completed' && t.createdAt && t.dateFin);
  const averageResponseTime = completedTickets.length > 0
    ? completedTickets.reduce((sum, ticket) => {
        const createdTime = new Date(ticket.createdAt).getTime();
        const endTime = new Date(ticket.dateFin).getTime();
        return sum + (endTime - createdTime) / (1000 * 60 * 60); // Convertir en heures
      }, 0) / completedTickets.length
    : 0;

  // Catégories les plus fréquentes
  const categoriesFrequency = {};
  tickets.forEach(ticket => {
    if (ticket.category) {
      categoriesFrequency[ticket.category] = (categoriesFrequency[ticket.category] || 0) + 1;
    }
  });

  const topCategories = Object.entries(categoriesFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Nombre total d'interventions par statut
  const statusCounts = {
    pending: tickets.filter(t => t.status === 'pending').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    termine_artisan: tickets.filter(t => t.status === 'termine_artisan').length,
    completed: tickets.filter(t => t.status === 'completed').length
  };

  return {
    interventionsByMonth,
    averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
    topCategories,
    statusCounts,
    totalTickets: tickets.length
  };
};

/**
 * 8. Récupérer tous les étudiants avec le comptage de leurs réclamations
 */
export const getStudents = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Récupérer tous les tickets
    const ticketsSnapshot = await getDocs(collection(db, "tickets"));
    const allTickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Enrichir les étudiants avec le comptage de tickets
    const studentsWithTickets = students.map(student => {
      const studentTickets = allTickets.filter(ticket => ticket.studentId === student.id);
      const completedTickets = studentTickets.filter(t => t.status === 'completed').length;
      const pendingTickets = studentTickets.filter(t => t.status === 'pending').length;
      const inProgressTickets = studentTickets.filter(t => t.status === 'in_progress' || t.status === 'termine_artisan').length;

      return {
        ...student,
        totalTickets: studentTickets.length,
        completedTickets,
        pendingTickets,
        inProgressTickets,
        isActive: student.isActive !== false // Par défaut true
      };
    });

    return studentsWithTickets;
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants:", error);
    throw error;
  }
};

/**
 * 9. Activer/Désactiver un compte étudiant
 */
export const toggleStudentStatus = async (studentId, isActive) => {
  try {
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
      isActive: !isActive,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
};

/**
 * 10. Récupérer tous les prestataires externes agréés
 */
export const getExternalProviders = async () => {
  try {
    const q = query(collection(db, "externalProviders"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération des prestataires:", error);
    throw error;
  }
};

/**
 * 11. Externaliser un ticket vers un prestataire agréé
 */
export const externalizeTicket = async (ticketId, providerId, providerData) => {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      isExternalized: true,
      externalizedToId: providerId,
      externalizedToName: providerData.name,
      externalizedToPhone: providerData.phone,
      externalizedToEmail: providerData.email,
      externalizedAt: new Date().toISOString(),
      status: "externalized",
      assignedToId: null,
      assignedToName: null
    });
  } catch (error) {
    console.error("Erreur lors de l'externalisation:", error);
    throw error;
  }
};

/**
 * 12. Créer un prestataire externe (Admin seulement)
 */
export const createExternalProvider = async (providerData) => {
  try {
    const providersRef = collection(db, "externalProviders");
    const newProvider = {
      name: providerData.name,
      email: providerData.email,
      phone: providerData.phone,
      specialties: providerData.specialties || [],
      isApproved: true,
      createdAt: new Date().toISOString(),
      rating: 0,
      completedTickets: 0
    };
    
    const docRef = await setDoc(doc(providersRef), newProvider);
    return docRef;
  } catch (error) {
    console.error("Erreur lors de la création du prestataire:", error);
    throw error;
  }
};