import React from 'react';

/**
 * Composant de filtrage et tri des tickets
 */
export const TicketFilters = ({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  categories,
  styles
}) => {
  return (
    <div style={styles.filterSection}>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Statut:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="termine_artisan">À Valider</option>
          <option value="completed">Terminé</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Catégorie:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">Toutes</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Tri:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="recent">Plus récent</option>
          <option value="urgent">Urgents en premier</option>
        </select>
      </div>
    </div>
  );
};
