import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  getArtisanNotifications, 
  getArtisanUnreadCount,
  markArtisanNotificationAsRead 
} from '../services/notificationService';
import { Sidebar, artisanStyles } from '../components/artisan';

/**
 * Page de notifications pour l'artisan
 */
export default function ArtisanNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadNotifications = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        navigate('/login');
        return;
      }

      const [notifs, count] = await Promise.all([
        getArtisanNotifications(userId),
        getArtisanUnreadCount(userId)
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications artisan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lue
      if (!notification.read) {
        await markArtisanNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }

      // Redirection selon le type
      if (notification.type === 'artisan_assigned') {
        // Rediriger vers la page principale avec le ticket
        navigate('/app/artisan');
      } else if (notification.type === 'artisan_rated') {
        // Rediriger vers l'historique pour voir l'évaluation
        navigate('/app/artisan');
      }
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes === 0 ? "À l'instant" : `Il y a ${minutes} min`;
    }
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }
    
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days}j`;
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    return type === 'artisan_assigned' ? '📋' : '⭐';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Sidebar
        activeTab="notifications"
        setActiveTab={() => {}}
        onLogout={async () => {
          await auth.signOut();
          navigate('/login');
        }}
        styles={artisanStyles}
        isMobile={isMobile}
      />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px',
        padding: isMobile ? '16px' : '30px',
        paddingBottom: isMobile ? '80px' : '30px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/app/artisan')}
            style={{
              background: '#e5e7eb',
              border: 'none',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            🔔 Notifications
          </h1>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: '20px',
              minWidth: '30px',
              textAlign: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '50px 30px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📭</div>
              <h3 style={{ color: '#475569', fontSize: '20px', marginBottom: '8px' }}>
                Aucune notification
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                Vous serez notifié lorsqu'un ticket vous sera assigné ou lorsqu'un résident vous notera
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.read ? 'white' : '#ecfdf5',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: notification.read 
                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  border: notification.read ? '1px solid #e5e7eb' : '2px solid #10b981',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = notification.read 
                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                {/* Badge non lu */}
                {!notification.read && (
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                )}

                <div style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start'
                }}>
                  {/* Icon */}
                  <div style={{
                    fontSize: '36px',
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      color: '#1e293b',
                      fontWeight: notification.read ? '500' : '700',
                      marginBottom: '8px',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </div>
                    
                    {/* Détails additionnels */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      {notification.location && (
                        <span style={{
                          fontSize: '13px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          📍 {notification.location}
                        </span>
                      )}
                      {notification.category && (
                        <span style={{
                          fontSize: '13px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          🔧 {notification.category}
                        </span>
                      )}
                      {notification.rating && (
                        <span style={{
                          fontSize: '13px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          {'⭐'.repeat(notification.rating)}
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <span>🕐 {formatDate(notification.createdAt)}</span>
                      <span>•</span>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        #{notification.ticketId?.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
