import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentData, useNotifications } from '../hooks/students';
import { StudentSidebar } from '../components/student';

/**
 * Page dédiée aux notifications de l'étudiant
 */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { userName, userId, loading } = useStudentData();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Rediriger vers la page de détail du ticket
    navigate(`/app/student/ticket/${notification.ticketId}`);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <StudentSidebar
        userName={userName}
        userEmail={userId}
        unreadNotifications={unreadCount}
      />

      <div style={{
        ...styles.mainContent,
        marginLeft: isMobile ? 0 : '260px',
        padding: isMobile ? '16px' : '24px',
        paddingTop: isMobile ? '70px' : '24px'
      }}>
        {/* En-tête */}
        <div style={{
          ...styles.header,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <div>
            <h1 style={{
              ...styles.title,
              fontSize: isMobile ? '22px' : '28px'
            }}>🔔 Notifications</h1>
            <p style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les notifications sont lues'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead} 
              style={{
                ...styles.markAllBtn,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Liste des notifications */}
        <div style={styles.notificationsList}>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔕</div>
              <h3 style={styles.emptyTitle}>Aucune notification</h3>
              <p style={styles.emptyText}>
                Vous n'avez pas encore reçu de notifications.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  ...styles.notificationCard,
                  backgroundColor: notification.read ? '#f9fafb' : '#ffffff',
                  borderLeft: notification.read ? '4px solid #e5e7eb' : '4px solid #005596'
                }}
              >
                <div style={styles.notificationHeader}>
                  <span style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div style={styles.notificationContent}>
                    <p style={{
                      ...styles.notificationMessage,
                      fontWeight: notification.read ? '400' : '600'
                    }}>
                      {notification.message}
                    </p>
                    <span style={styles.notificationTime}>
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.read && (
                    <div style={styles.unreadDot} title="Non lu"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Fonction pour obtenir l'icône selon le type de notification
const getNotificationIcon = (type) => {
  const icons = {
    assigned: '👷',
    in_progress: '🔧',
    completed: '✅',
    closed: '🔒',
    cancelled: '❌',
    reassigned: '🔄'
  };
  return icons[type] || '📢';
};

// Fonction pour formater le temps relatif
const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const notifDate = date instanceof Date ? date : new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  
  return notifDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: notifDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '16px',
  },
  title: {
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  markAllBtn: {
    padding: '10px 20px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  notificationCard: {
    padding: '16px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  notificationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  notificationIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  notificationMessage: {
    fontSize: '15px',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: '1.5',
  },
  notificationTime: {
    fontSize: '13px',
    color: '#666',
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    flexShrink: 0,
    marginTop: '6px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#666',
  },
};
