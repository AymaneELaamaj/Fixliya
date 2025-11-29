import React from 'react';
import { getRelativeTime } from '../../../services/notificationService';

export default function NotificationToast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div style={styles.toastContainer}>
      <div style={styles.toast}>
        <div style={styles.toastHeader}>
          <span style={styles.toastIcon}>🔔</span>
          <span style={styles.toastTitle}>Nouvelle notification</span>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.toastMessage}>{notification.message}</div>
        <div style={styles.toastTime}>{getRelativeTime(notification.createdAt)}</div>
      </div>
    </div>
  );
}

const styles = {
  toastContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 10000,
    animation: 'slideIn 0.3s ease-out'
  },

  toast: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    padding: '16px',
    minWidth: '320px',
    maxWidth: '400px',
    border: '2px solid #005596'
  },

  toastHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },

  toastIcon: {
    fontSize: '20px'
  },

  toastTitle: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1f2937'
  },

  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6b7280',
    padding: '0',
    width: '24px',
    height: '24px'
  },

  toastMessage: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
    lineHeight: '1.5'
  },

  toastTime: {
    fontSize: '12px',
    color: '#9ca3af'
  }
};

// Ajouter l'animation CSS
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`, styleSheet.cssRules.length);
