import React from 'react';

/**
 * Barre de statistiques pour l'historique
 */
export const HistoryStatsBar = ({ history, styles }) => {
  const validatedCount = history.filter(h => h.status === 'completed' && h.rating).length;
  const pendingCount = history.filter(h => h.status === 'termine_artisan').length;

  return (
    <div style={styles.historyStatsBar}>
      <div style={styles.statBox}>
        <span style={styles.statNumber}>{validatedCount}</span>
        <span style={styles.statLabel}>Validées & Notées</span>
      </div>
      <div style={styles.statDivider}>|</div>
      <div style={styles.statBox}>
        <span style={styles.statNumber}>{pendingCount}</span>
        <span style={styles.statLabel}>En attente de validation</span>
      </div>
    </div>
  );
};
