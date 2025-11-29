import React from 'react';
import { getStatusInfo } from '../utils/statusHelpers';

/**
 * Carte pour afficher un ticket individuel
 */
export default function TicketCard({ ticket, onValidate, onCancel, onArchive, canArchive, styles }) {
  const statusInfo = getStatusInfo(ticket.status);
  
  // Vérifier si le ticket est récent (moins de 24h)
  const isNew = () => {
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div style={styles?.ticketCard || defaultStyles.ticketCard}>
      <div
        style={{
          ...(styles?.urgentIndicator || defaultStyles.urgentIndicator),
          backgroundColor: ticket.isUrgent ? '#ef4444' : '#e5e7eb'
        }}
      />

      <div style={styles?.cardContent || defaultStyles.cardContent}>
        <div style={styles?.cardHeader || defaultStyles.cardHeader}>
          <div style={styles?.headerLeft || defaultStyles.headerLeft}>
            <span style={styles?.categoryBadge || defaultStyles.categoryBadge}>
              {ticket.category}
            </span>
            {ticket.isUrgent && (
              <span style={styles?.urgentBadge || defaultStyles.urgentBadge}>
                ⚠️ URGENT
              </span>
            )}
            {isNew() && !ticket.archived && (
              <span style={defaultStyles.newBadge}>✨ Nouveau</span>
            )}
            {ticket.archived && (
              <span style={defaultStyles.archivedBadge}>📦 Archivé</span>
            )}
          </div>
          <span
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.color,
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        <p style={styles?.description || defaultStyles.description}>
          {ticket.description}
        </p>

        <p style={styles?.location || defaultStyles.location}>
          📍 {ticket.location}
        </p>

        {/* Afficher l'artisan assigné */}
        {ticket.assignedToName && (
          <p style={defaultStyles.artisan}>
            👨‍🔧 Assigné à : {ticket.assignedToName}
          </p>
        )}

        <div style={styles?.cardFooter || defaultStyles.cardFooter}>
          <span style={styles?.date || defaultStyles.date}>
            📅 {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
          </span>

          <div style={defaultStyles.actions}>
            {/* BOUTON DE VALIDATION (Visible seulement si l'artisan a fini) */}
            {ticket.status === 'termine_artisan' && onValidate && (
              <button 
                onClick={() => onValidate(ticket)} 
                style={styles?.validateBtn || defaultStyles.validateBtn}
              >
                ⭐ Valider & Noter
              </button>
            )}

            {/* AFFICHER LA NOTE SI TERMINÉ */}
            {ticket.status === 'completed' && ticket.rating && (
              <span style={styles?.ratingDisplay || defaultStyles.ratingDisplay}>
                Note : {ticket.rating}/5 ⭐
              </span>
            )}

            {/* BOUTON D'ANNULATION (Visible si en attente ou en cours) */}
            {(ticket.status === 'pending' || ticket.status === 'in_progress') && onCancel && (
              <button
                onClick={() => onCancel(ticket)}
                style={styles?.ticketCancelBtn || defaultStyles.ticketCancelBtn}
              >
                ✕ Annuler
              </button>
            )}

            {/* BOUTON D'ARCHIVAGE */}
            {canArchive && canArchive(ticket) && onArchive && (
              <button
                onClick={() => onArchive(ticket.id)}
                style={defaultStyles.archiveBtn}
                title="Archiver cette réclamation"
              >
                📦 Archiver
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles par défaut
const defaultStyles = {
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    marginBottom: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },

  urgentIndicator: {
    width: '5px',
    minHeight: '100%'
  },

  cardContent: {
    flex: 1,
    padding: '15px'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '10px',
    flexWrap: 'wrap'
  },

  headerLeft: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    flex: 1
  },

  categoryBadge: {
    backgroundColor: '#eff6ff',
    color: '#005596',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },

  urgentBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  newBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  archivedBadge: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  description: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 10px 0',
    lineHeight: '1.5'
  },

  location: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 8px 0'
  },

  artisan: {
    fontSize: '13px',
    color: '#059669',
    margin: '0 0 12px 0',
    fontWeight: '600'
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6'
  },

  date: {
    fontSize: '12px',
    color: '#9ca3af'
  },

  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  validateBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },

  ticketCancelBtn: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  archiveBtn: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  ratingDisplay: {
    fontSize: '13px',
    color: '#f59e0b',
    fontWeight: '600'
  }
};
