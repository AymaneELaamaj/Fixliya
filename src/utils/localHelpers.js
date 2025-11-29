// src/utils/localHelpers.js

/**
 * Utilitaires pour la gestion et l'affichage des locaux
 */

import { LOCAL_TYPES } from '../services/localService';

/**
 * Formate une localisation pour l'affichage dans un ticket
 * @param {Object} ticket - Le ticket contenant les informations de localisation
 * @returns {string} - La localisation formatée
 */
export const formatTicketLocation = (ticket) => {
  if (!ticket) return 'Non spécifié';
  
  // Si le ticket a déjà une location formatée, l'utiliser
  if (ticket.location) {
    return ticket.location;
  }
  
  // Sinon, construire la localisation depuis les champs
  if (ticket.locationType === 'building' && ticket.localName && ticket.roomNumber) {
    return `${ticket.localName} - Chambre ${ticket.roomNumber}`;
  }
  
  if (ticket.locationType === 'common_area' && ticket.localName) {
    return ticket.localName;
  }
  
  return 'Localisation non spécifiée';
};

/**
 * Extrait le nom du bâtiment depuis une localisation formatée
 * @param {string} location - La localisation formatée
 * @returns {string} - Le nom du bâtiment ou null
 */
export const extractBuildingName = (location) => {
  if (!location) return null;
  
  // Format attendu: "Bâtiment X - Chambre Y"
  const parts = location.split(' - ');
  return parts.length > 0 ? parts[0].trim() : null;
};

/**
 * Extrait le numéro de chambre depuis une localisation formatée
 * @param {string} location - La localisation formatée
 * @returns {string} - Le numéro de chambre ou null
 */
export const extractRoomNumber = (location) => {
  if (!location) return null;
  
  const match = location.match(/Chambre\s+(\S+)/i);
  return match ? match[1] : null;
};

/**
 * Valide un numéro de chambre
 * @param {string} roomNumber - Le numéro de chambre à valider
 * @param {number} maxRooms - Le nombre maximum de chambres dans le bâtiment
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateRoomNumber = (roomNumber, maxRooms = null) => {
  if (!roomNumber || roomNumber.trim() === '') {
    return {
      isValid: false,
      error: "Le numéro de chambre est requis"
    };
  }

  // Accepter formats: 101, A101, 1-01, etc.
  const trimmed = roomNumber.trim();
  
  if (trimmed.length > 10) {
    return {
      isValid: false,
      error: "Le numéro de chambre est trop long"
    };
  }

  // Si maxRooms est fourni et que le numéro est purement numérique
  if (maxRooms && /^\d+$/.test(trimmed)) {
    const roomNum = parseInt(trimmed, 10);
    if (roomNum < 1 || roomNum > maxRooms) {
      return {
        isValid: false,
        error: `Le numéro doit être entre 1 et ${maxRooms}`
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Génère un résumé du local pour l'affichage
 * @param {Object} local - L'objet local
 * @returns {string} - Résumé du local
 */
export const getLocalSummary = (local) => {
  if (!local) return '';
  
  if (local.type === LOCAL_TYPES.BUILDING) {
    return `${local.floors} étages, ${local.totalRooms} chambres`;
  }
  
  if (local.type === LOCAL_TYPES.COMMON_AREA) {
    const parts = [local.category];
    if (local.capacity) {
      parts.push(`${local.capacity} pers.`);
    }
    return parts.join(' - ');
  }
  
  return '';
};

/**
 * Filtre les locaux par recherche textuelle
 * @param {Array} locals - Liste de locaux
 * @param {string} searchQuery - Requête de recherche
 * @returns {Array} - Locaux filtrés
 */
export const filterLocalsBySearch = (locals, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return locals;
  }
  
  const query = searchQuery.toLowerCase().trim();
  
  return locals.filter(local => {
    const searchableText = [
      local.name,
      local.description,
      local.category,
      local.type === LOCAL_TYPES.BUILDING ? 'bâtiment' : 'espace commun'
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(query);
  });
};

/**
 * Trie les locaux selon un critère
 * @param {Array} locals - Liste de locaux
 * @param {string} sortBy - Critère de tri ('name', 'type', 'recent')
 * @returns {Array} - Locaux triés
 */
export const sortLocals = (locals, sortBy = 'name') => {
  const sorted = [...locals];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'type':
      return sorted.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === LOCAL_TYPES.BUILDING ? -1 : 1;
      });
    
    case 'recent':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    
    default:
      return sorted;
  }
};

/**
 * Groupe les locaux par type
 * @param {Array} locals - Liste de locaux
 * @returns {Object} - { buildings: [], commonAreas: [] }
 */
export const groupLocalsByType = (locals) => {
  return {
    buildings: locals.filter(l => l.type === LOCAL_TYPES.BUILDING),
    commonAreas: locals.filter(l => l.type === LOCAL_TYPES.COMMON_AREA)
  };
};

/**
 * Génère des statistiques sur les locaux
 * @param {Array} locals - Liste de locaux
 * @returns {Object} - Statistiques
 */
export const getLocalsStats = (locals) => {
  const { buildings, commonAreas } = groupLocalsByType(locals);
  
  const totalRooms = buildings.reduce((sum, b) => sum + (b.totalRooms || 0), 0);
  const activeLocals = locals.filter(l => l.isActive !== false).length;
  
  return {
    total: locals.length,
    buildings: buildings.length,
    commonAreas: commonAreas.length,
    totalRooms,
    active: activeLocals,
    inactive: locals.length - activeLocals
  };
};

/**
 * Vérifie si un local peut être supprimé (aucun ticket associé)
 * @param {string} localId - ID du local
 * @param {Array} tickets - Liste de tous les tickets
 * @returns {Object} - { canDelete: boolean, ticketCount: number }
 */
export const canDeleteLocal = (localId, tickets) => {
  const associatedTickets = tickets.filter(t => t.localId === localId);
  
  return {
    canDelete: associatedTickets.length === 0,
    ticketCount: associatedTickets.length,
    message: associatedTickets.length > 0 
      ? `Impossible de supprimer : ${associatedTickets.length} ticket(s) associé(s)`
      : 'Suppression possible'
  };
};

/**
 * Génère une suggestion de nom de chambre
 * @param {number} floor - Numéro d'étage
 * @param {number} roomOnFloor - Numéro de chambre sur l'étage
 * @returns {string} - Format suggéré (ex: "205" pour étage 2, chambre 5)
 */
export const suggestRoomNumber = (floor, roomOnFloor) => {
  return `${floor}${String(roomOnFloor).padStart(2, '0')}`;
};

/**
 * Parse un numéro de chambre pour extraire l'étage
 * @param {string} roomNumber - Numéro de chambre (ex: "205")
 * @returns {number} - Numéro d'étage estimé ou null
 */
export const extractFloorFromRoom = (roomNumber) => {
  if (!roomNumber) return null;
  
  // Si le format est numérique type "205"
  if (/^\d{3,}$/.test(roomNumber)) {
    return parseInt(roomNumber.charAt(0), 10);
  }
  
  return null;
};

export default {
  formatTicketLocation,
  extractBuildingName,
  extractRoomNumber,
  validateRoomNumber,
  getLocalSummary,
  filterLocalsBySearch,
  sortLocals,
  groupLocalsByType,
  getLocalsStats,
  canDeleteLocal,
  suggestRoomNumber,
  extractFloorFromRoom
};
