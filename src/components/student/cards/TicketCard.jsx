import React from 'react';
import { getStatusInfo } from '../utils/statusHelpers';

/**
 * Carte pour afficher un ticket individuel
 */
export const TicketCard = ({ ticket, onValidate, onCancel, styles }) => {
  const statusInfo = getStatusInfo(ticket.status);

  return (
    <div style={styles.ticketCard}>
      <div
        style={{
          ...styles.urgentIndicator,
          backgroundColor: ticket.isUrgent ? '#ef4444' : '#e5e7eb'
        }}
      />

      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.categoryBadge}>{ticket.category}</span>
            {ticket.isUrgent && (
              <span style={styles.urgentBadge}>🚨 URGENT</span>
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

        <p style={styles.description}>{ticket.description}</p>

        <p style={styles.location}>📍 {ticket.location}</p>

        <div style={styles.cardFooter}>
          <span style={styles.date}>
            📅 {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
          </span>

          {/* BOUTON DE VALIDATION (Visible seulement si l'artisan a fini) */}
          {ticket.status === 'termine_artisan' && (
            <button onClick={() => onValidate(ticket)} style={styles.validateBtn}>
              ⭐ Valider & Noter
            </button>
          )}

          {/* AFFICHER LA NOTE SI TERMINÉ */}
          {ticket.status === 'completed' && ticket.rating && (
            <span style={styles.ratingDisplay}>
              Note : {ticket.rating}/5 ⭐
            </span>
          )}

          {/* BOUTON D'ANNULATION (Visible si en attente ou en cours) */}
          {(ticket.status === 'pending' || ticket.status === 'in_progress') && (
            <button
              onClick={() => onCancel(ticket)}
              style={styles.ticketCancelBtn}
            >
              ✕ Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
