import React from 'react';

/**
 * En-tête de l'espace étudiant avec salutation et bouton de déconnexion
 */
export const StudentHeader = ({ userName, onLogout, styles }) => {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.welcome}>Bonjour, {userName} 👋</h1>
        <p style={styles.subtitle}>Espace Résident</p>
      </div>
      <button onClick={onLogout} style={styles.logoutBtn}>
        Déconnexion
      </button>
    </header>
  );
};
