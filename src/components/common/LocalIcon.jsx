// src/components/common/LocalIcon.jsx
import React from 'react';
import { LOCAL_TYPES } from '../../services/localService';
import { CATEGORY_ICONS, BUILDING_ICON } from '../../constants/locals';

/**
 * Composant pour afficher l'icône appropriée selon le type de local
 * Optimisé et réutilisable
 */
export default function LocalIcon({ local, size = '2rem', className = '' }) {
  const getIcon = () => {
    if (!local) return '📍';
    
    if (local.type === LOCAL_TYPES.BUILDING) {
      return BUILDING_ICON;
    }
    
    // Pour les espaces communs, retourner l'icône selon la catégorie
    return CATEGORY_ICONS[local.category] || CATEGORY_ICONS['Autre'];
  };

  const styles = {
    icon: {
      fontSize: size,
      lineHeight: 1,
      display: 'inline-block',
      userSelect: 'none'
    }
  };

  return (
    <span 
      className={className} 
      style={styles.icon}
      role="img"
      aria-label={local?.name || 'Local'}
    >
      {getIcon()}
    </span>
  );
}

/**
 * Variante pour afficher uniquement l'icône d'un type de local
 */
export function LocalTypeIcon({ type, category = null, size = '2rem' }) {
  const getIcon = () => {
    if (type === LOCAL_TYPES.BUILDING) {
      return BUILDING_ICON;
    }
    if (type === LOCAL_TYPES.COMMON_AREA && category) {
      return CATEGORY_ICONS[category] || CATEGORY_ICONS['Autre'];
    }
    return '📍';
  };

  return (
    <span 
      style={{ 
        fontSize: size, 
        lineHeight: 1, 
        display: 'inline-block' 
      }}
      role="img"
      aria-label={category || type}
    >
      {getIcon()}
    </span>
  );
}
