import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../../services/authService';

export default function StudentSidebar({ 
  userName, 
  userEmail, 
  unreadNotifications = 0,
  activeTicketsCount = 0 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'tickets',
      label: 'Mes Réclamations',
      icon: '📋',
      path: '/app/student',
      badge: activeTicketsCount > 0 ? activeTicketsCount : null
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/app/student/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      badgeColor: '#ef4444'
    },
    {
      id: 'history',
      label: 'Historique',
      icon: '📊',
      path: '/app/student/history'
    },
    {
      id: 'new-ticket',
      label: 'Nouvelle Réclamation',
      icon: '➕',
      path: '/app/student/create-ticket',
      highlight: true
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: '👤',
      path: '/app/student/profile'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{
          ...styles.mobileToggle,
          display: isMobile ? 'block' : 'none'
        }}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay pour mobile */}
      {isMobileOpen && (
        <div 
          style={styles.overlay} 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: isCollapsed ? '80px' : '260px',
        transform: isMobileOpen ? 'translateX(0)' : undefined
      }}>
        {/* Header */}
        <div style={styles.sidebarHeader}>
          {!isCollapsed && (
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🏢</span>
              <span style={styles.logoText}>FixLiya</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              ...styles.collapseBtn,
              display: isMobile ? 'none' : 'block'
            }}
            title={isCollapsed ? 'Développer' : 'Réduire'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) && styles.navItemActive),
                ...(item.highlight && styles.navItemHighlight),
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span style={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      ...styles.badge,
                      backgroundColor: item.badgeColor || '#005596'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span style={styles.badgeDot} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer avec info utilisateur */}
        {!isCollapsed && (
          <div style={styles.sidebarFooter}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {userName?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{userName || 'Étudiant'}</div>
                <div style={styles.userEmail}>{userEmail || ''}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Déconnexion
            </button>
          </div>
        )}

        {isCollapsed && (
          <button onClick={handleLogout} style={styles.logoutBtnCollapsed} title="Déconnexion">
            🚪
          </button>
        )}
      </aside>
    </>
  );
}

const styles = {
  // Mobile Toggle
  mobileToggle: {
    display: 'none',
    position: 'fixed',
    top: '15px',
    left: '15px',
    zIndex: 1001,
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    width: '45px',
    height: '45px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    '@media (max-width: 768px)': {
      display: 'block'
    }
  },

  overlay: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999
    }
  },

  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease, transform 0.3s ease',
    zIndex: 1000,
    boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
    overflowY: 'auto',
    '@media (max-width: 768px)': {
      transform: 'translateX(-100%)',
      width: '260px'
    }
  },

  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '70px'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  logoIcon: {
    fontSize: '28px'
  },

  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#005596'
  },

  collapseBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6b7280',
    padding: '5px',
    display: 'none',
    '@media (min-width: 769px)': {
      display: 'block'
    }
  },

  nav: {
    flex: 1,
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '15px',
    color: '#374151',
    textAlign: 'left',
    position: 'relative',
    fontWeight: '500'
  },

  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#005596',
    fontWeight: '600'
  },

  navItemHighlight: {
    backgroundColor: '#005596',
    color: 'white',
    fontWeight: '600'
  },

  navIcon: {
    fontSize: '20px',
    minWidth: '20px',
    textAlign: 'center'
  },

  navLabel: {
    flex: 1
  },

  badge: {
    backgroundColor: '#005596',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },

  badgeDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%'
  },

  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px'
  },

  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#005596',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },

  userDetails: {
    flex: 1,
    overflow: 'hidden'
  },

  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  logoutBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  logoutBtnCollapsed: {
    width: '50px',
    height: '50px',
    margin: '10px auto',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
