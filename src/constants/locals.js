// src/constants/locals.js

/**
 * Constantes pour le système de gestion des locaux
 * Centralise toutes les valeurs fixes pour faciliter la maintenance
 */

// Types de locaux
export const LOCAL_TYPES = {
  BUILDING: 'building',
  COMMON_AREA: 'common_area'
};

// Catégories d'espaces communs
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

// Icônes pour les catégories d'espaces communs
export const CATEGORY_ICONS = {
  'Buvette': '☕',
  'Terrain de sport': '⚽',
  'Salle d\'étude': '📚',
  'Parking': '🚗',
  'Buanderie': '🧺',
  'Salle de détente': '🛋️',
  'Bibliothèque': '📖',
  'Gymnase': '🏋️',
  'Cafétéria': '🍽️',
  'Jardin': '🌳',
  'Autre': '🏛️'
};

// Icône par défaut pour les bâtiments
export const BUILDING_ICON = '🏢';

// Messages de validation
export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Le nom du local est requis",
  TYPE_REQUIRED: "Le type de local est requis",
  ROOMS_INVALID: "Le nombre de chambres doit être supérieur à 0",
  FLOORS_INVALID: "Le nombre d'étages doit être supérieur à 0",
  CATEGORY_REQUIRED: "La catégorie est requise pour les espaces communs"
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOCAL_CREATED: '✅ Local créé avec succès !',
  LOCAL_UPDATED: '✅ Local modifié avec succès !',
  LOCAL_DELETED: '✅ Local supprimé avec succès !',
  STATUS_CHANGED: '✅ Statut mis à jour avec succès !'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  FETCH_ERROR: "Erreur lors du chargement des locaux",
  CREATE_ERROR: "Erreur lors de la création du local",
  UPDATE_ERROR: "Erreur lors de la modification du local",
  DELETE_ERROR: "Erreur lors de la suppression du local",
  DELETE_CONFIRM: "Êtes-vous sûr de vouloir supprimer ce local ?"
};

// Configuration des formulaires
export const FORM_CONFIG = {
  MIN_ROOMS: 1,
  MAX_ROOMS: 1000,
  MIN_FLOORS: 1,
  MAX_FLOORS: 50,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 10000
};

// Configuration de la pagination (pour future implémentation)
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 12,
  MAX_VISIBLE_PAGES: 5
};

// Breakpoints responsive (en pixels)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440
};

// Taille minimale des éléments tactiles (en pixels)
export const TOUCH_TARGET_SIZE = {
  MIN: 44, // iOS recommandation
  RECOMMENDED: 48 // Material Design recommandation
};

// Délais d'animation (en millisecondes)
export const ANIMATION_DELAYS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
};

// Couleurs du thème
export const THEME_COLORS = {
  PRIMARY: '#4CAF50',
  SECONDARY: '#1976d2',
  DANGER: '#f44336',
  WARNING: '#f59e0b',
  SUCCESS: '#16a34a',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280'
};

// États des filtres
export const FILTER_STATES = {
  ALL: 'all',
  BUILDINGS: 'buildings',
  COMMON_AREAS: 'common_areas'
};

// Limite de caractères pour les champs
export const CHARACTER_LIMITS = {
  NAME: 100,
  DESCRIPTION: 500
};

export default {
  LOCAL_TYPES,
  COMMON_AREA_CATEGORIES,
  CATEGORY_ICONS,
  BUILDING_ICON,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  FORM_CONFIG,
  PAGINATION_CONFIG,
  BREAKPOINTS,
  TOUCH_TARGET_SIZE,
  ANIMATION_DELAYS,
  THEME_COLORS,
  FILTER_STATES,
  CHARACTER_LIMITS
};
