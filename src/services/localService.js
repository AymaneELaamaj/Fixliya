// src/services/localService.js
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy 
} from "firebase/firestore";

/**
 * Types de locaux disponibles
 */
export const LOCAL_TYPES = {
  BUILDING: 'building', // Bâtiment/Résidence
  COMMON_AREA: 'common_area' // Espace commun
};

/**
 * Catégories d'espaces communs
 */
export const COMMON_AREA_CATEGORIES = [
  'Buvette',
  'Terrain de sport',
  'Salle d\'étude',
  'Parking',
  'Buanderie',
  'Salle de détente',
  'Bibliothèque',
  'Gymnase',
  'Cafétéria',
  'Jardin',
  'Autre'
];

/**
 * Récupérer tous les locaux
 */
export const getAllLocals = async () => {
  try {
    const q = query(collection(db, "locals"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Erreur récupération locaux:", error);
    throw error;
  }
};

/**
 * Récupérer uniquement les bâtiments
 */
export const getBuildings = async () => {
  try {
    const locals = await getAllLocals();
    return locals.filter(local => local.type === LOCAL_TYPES.BUILDING);
  } catch (error) {
    console.error("Erreur récupération bâtiments:", error);
    throw error;
  }
};

/**
 * Récupérer uniquement les espaces communs
 */
export const getCommonAreas = async () => {
  try {
    const locals = await getAllLocals();
    return locals.filter(local => local.type === LOCAL_TYPES.COMMON_AREA);
  } catch (error) {
    console.error("Erreur récupération espaces communs:", error);
    throw error;
  }
};

/**
 * Créer un nouveau local
 */
export const createLocal = async (localData) => {
  try {
    const newLocal = {
      name: localData.name,
      type: localData.type,
      description: localData.description || "",
      // Pour les bâtiments
      totalRooms: localData.totalRooms || null,
      floors: localData.floors || null,
      // Pour les espaces communs
      category: localData.category || null,
      capacity: localData.capacity || null,
      // Métadonnées
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, "locals"), newLocal);
    return { id: docRef.id, ...newLocal };
  } catch (error) {
    console.error("Erreur création local:", error);
    throw error;
  }
};

/**
 * Mettre à jour un local existant
 */
export const updateLocal = async (localId, localData) => {
  try {
    const localRef = doc(db, "locals", localId);
    const updatedData = {
      ...localData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(localRef, updatedData);
    return { id: localId, ...updatedData };
  } catch (error) {
    console.error("Erreur mise à jour local:", error);
    throw error;
  }
};

/**
 * Supprimer un local
 */
export const deleteLocal = async (localId) => {
  try {
    const localRef = doc(db, "locals", localId);
    await deleteDoc(localRef);
  } catch (error) {
    console.error("Erreur suppression local:", error);
    throw error;
  }
};

/**
 * Désactiver/Activer un local (soft delete)
 */
export const toggleLocalStatus = async (localId, isActive) => {
  try {
    const localRef = doc(db, "locals", localId);
    await updateDoc(localRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur changement statut local:", error);
    throw error;
  }
};

/**
 * Formater le local pour l'affichage dans les tickets
 * @param {Object} local - L'objet local
 * @param {string} roomNumber - Numéro de chambre (pour les bâtiments)
 * @returns {string} - Localisation formatée
 */
export const formatLocalForTicket = (local, roomNumber = null) => {
  if (local.type === LOCAL_TYPES.BUILDING && roomNumber) {
    return `${local.name} - Chambre ${roomNumber}`;
  }
  return local.name;
};

/**
 * Valider les données d'un local avant création/modification
 */
export const validateLocalData = (localData) => {
  const errors = {};

  if (!localData.name || localData.name.trim() === '') {
    errors.name = "Le nom du local est requis";
  }

  if (!localData.type) {
    errors.type = "Le type de local est requis";
  }

  if (localData.type === LOCAL_TYPES.BUILDING) {
    if (!localData.totalRooms || localData.totalRooms <= 0) {
      errors.totalRooms = "Le nombre de chambres doit être supérieur à 0";
    }
    if (!localData.floors || localData.floors <= 0) {
      errors.floors = "Le nombre d'étages doit être supérieur à 0";
    }
  }

  if (localData.type === LOCAL_TYPES.COMMON_AREA) {
    if (!localData.category) {
      errors.category = "La catégorie est requise pour les espaces communs";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
