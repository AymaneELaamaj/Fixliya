import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtisanUnreadCount } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Barre latérale de navigation pour l'artisan
 */
export const Sidebar = ({ activeTab, setActiveTab, onLogout, styles, isMobile }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.uid) {
        const count = await getArtisanUnreadCount(user.uid);
        setUnreadCount(count);
      }
    };

    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);
  if (isMobile) {
    // Navbar mobile en bas
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 10px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setActiveTab('todo')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'todo' ? '#fff' : 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'todo' ? 'rgba(255,255,255,0.2)' : 'transparent',
            fontWeight: activeTab === 'todo' ? '700' : '500',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '20px' }}>📋</span>
          <span>Ma Journée</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'history' ? '#fff' : 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'history' ? 'rgba(255,255,255,0.2)' : 'transparent',
            fontWeight: activeTab === 'history' ? '700' : '500',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '20px' }}>📊</span>
          <span>Historique</span>
        </button>
        <button
          onClick={() => navigate('/app/artisan/notifications')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '20px' }}>🔔</span>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '8px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              border: '2px solid #667eea'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          <span>Déconnexion</span>
        </button>
      </nav>
    );
  }

  // Desktop sidebar
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
        <button
          onClick={() => navigate('/app/artisan/notifications')}
          style={{
            ...styles.navButton,
            position: 'relative',
            marginTop: '10px'
          }}
        >
          🔔 Notifications
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </nav>
      <button onClick={onLogout} style={styles.logoutBtnSidebar}>
        🚪 Déconnexion
      </button>
    </aside>
  );
};
