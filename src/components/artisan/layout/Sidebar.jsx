import React from 'react';

/**
 * Barre latérale de navigation pour l'artisan
 */
export const Sidebar = ({ activeTab, setActiveTab, onLogout, styles }) => {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2 style={styles.sidebarTitle}>🛠️ Artisan</h2>
      </div>
      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab('todo')}
          style={activeTab === 'todo' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          📋 Ma Journée
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={activeTab === 'history' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          📊 Historique & Avis
        </button>
      </nav>
      <button onClick={onLogout} style={styles.logoutBtnSidebar}>
        🚪 Déconnexion
      </button>
    </aside>
  );
};
