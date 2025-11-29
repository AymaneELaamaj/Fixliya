import React from 'react';

/**
 * Composant pour afficher un état vide
 */
export const EmptyState = ({ icon, title, message, styles }) => {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon}</div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
};
