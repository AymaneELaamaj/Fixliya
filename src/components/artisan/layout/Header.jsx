import React from 'react';

/**
 * En-tête de la zone de contenu principal
 */
export const Header = ({ activeTab, missionsCount, historyCount, styles }) => {
  return (
    <header style={styles.header}>
      <h1 style={styles.pageTitle}>
        {activeTab === 'todo' ? '📋 Ma Journée' : '📊 Historique & Avis'}
      </h1>
      <p style={styles.subtitle}>
        {activeTab === 'todo'
          ? `Vous avez ${missionsCount} intervention(s)`
          : `${historyCount} intervention(s) terminée(s)`}
      </p>
    </header>
  );
};
