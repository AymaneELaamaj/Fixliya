import React from 'react';
import styles from '../styles/AdminDashboard.module.css';

const TABS = [
  { id: 'tickets', label: '📋 Gérer les Tickets', icon: '📋' },
  { id: 'artisans', label: '👨‍🔧 Gérer les Artisans', icon: '👨‍🔧' },
  { id: 'statistics', label: '📊 Statistiques & Rapports', icon: '📊' },
  { id: 'students', label: '👨‍🎓 Gestion Étudiants', icon: '👨‍🎓' }
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>🛠️ Admin</h2>
      </div>

      <nav className={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${styles.navButton} ${activeTab === tab.id ? styles.navButtonActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button onClick={onLogout} className={styles.logoutBtn}>
        🚪 Déconnexion
      </button>
    </aside>
  );
}