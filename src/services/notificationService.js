import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  Timestamp 
} from "firebase/firestore";

/**
 * Types de notifications
 */
export const NOTIFICATION_TYPES = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
  REASSIGNED: 'reassigned'
};

/**
 * Messages pour chaque type de notification
 */
const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPES.ASSIGNED]: (ticketId, artisanName) => 
    `Votre réclamation a été assignée à ${artisanName}`,
  [NOTIFICATION_TYPES.IN_PROGRESS]: (ticketId, artisanName) => 
    `${artisanName} a commencé l'intervention sur votre réclamation`,
  [NOTIFICATION_TYPES.COMPLETED]: (ticketId, artisanName) => 
    `${artisanName} a terminé l'intervention. Veuillez valider le travail`,
  [NOTIFICATION_TYPES.CLOSED]: () => 
    `Votre réclamation a été clôturée`,
  [NOTIFICATION_TYPES.CANCELLED]: () => 
    `Votre réclamation a été annulée`,
  [NOTIFICATION_TYPES.REASSIGNED]: (ticketId, newArtisanName) => 
    `Votre réclamation a été réassignée à ${newArtisanName}`
};

/**
 * Créer une notification pour un étudiant
 */
export const createNotification = async (studentId, ticketId, type, additionalData = {}) => {
  try {
    const message = typeof NOTIFICATION_MESSAGES[type] === 'function'
      ? NOTIFICATION_MESSAGES[type](ticketId, additionalData.artisanName || additionalData.newArtisanName)
      : NOTIFICATION_MESSAGES[type](ticketId);

    const notification = {
      studentId,
      ticketId,
      type,
      message,
      read: false,
      createdAt: Timestamp.now(),
      ...additionalData
    };

    await addDoc(collection(db, "notifications"), notification);
    return true;
  } catch (error) {
    console.error("Erreur création notification:", error);
    throw error;
  }
};

/**
 * Récupérer toutes les notifications d'un étudiant
 * Note: Tri côté client pour éviter l'erreur d'index Firebase
 */
export const getStudentNotifications = async (studentId) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("studentId", "==", studentId)
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Tri côté client par date décroissante
    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    return [];
  }
};

/**
 * Récupérer les notifications non lues d'un étudiant
 * Note: Filtre et tri côté client pour éviter l'erreur d'index Firebase
 */
export const getUnreadNotifications = async (studentId) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("studentId", "==", studentId)
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Filtrage et tri côté client
    return notifications
      .filter(n => !n.read)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erreur récupération notifications non lues:", error);
    return [];
  }
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erreur marquage notification:", error);
    throw error;
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (studentId) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("studentId", "==", studentId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: Timestamp.now()
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Erreur marquage toutes notifications:", error);
    throw error;
  }
};

/**
 * Écouter les nouvelles notifications en temps réel
 * Note: Tri côté client pour éviter l'erreur d'index Firebase
 */
export const subscribeToNotifications = (studentId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("studentId", "==", studentId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Tri côté client par date décroissante
    const sortedNotifications = notifications.sort((a, b) => b.createdAt - a.createdAt);
    callback(sortedNotifications);
  }, (error) => {
    console.error("Erreur écoute notifications:", error);
  });
};

/**
 * Formater le temps relatif (il y a X minutes/heures/jours)
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
  
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
