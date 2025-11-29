import React from 'react';

/**
 * Modale pour valider et noter un ticket
 */
export const ValidationModal = ({
  ticket,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onConfirm,
  onCancel,
  styles
}) => {
  if (!ticket) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <h3 style={styles.modalTitle}>Validation de l'intervention</h3>

        {/* Afficher les photos avant/après si disponibles */}
        {(ticket.beforePhoto || ticket.afterPhoto) && (
          <div style={styles.photosSection}>
            <h4 style={styles.photosTitle}>📸 Preuve du travail</h4>
            <div style={styles.photosContainer}>
              {ticket.beforePhoto && (
                <div style={styles.photoItem}>
                  <p style={styles.photoLabel}>Avant</p>
                  <img
                    src={ticket.beforePhoto}
                    style={styles.photoImage}
                    alt="Avant"
                  />
                </div>
              )}
              {ticket.afterPhoto && (
                <div style={styles.photoItem}>
                  <p style={styles.photoLabel}>Après</p>
                  <img
                    src={ticket.afterPhoto}
                    style={styles.photoImage}
                    alt="Après"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <p style={styles.validationText}>
          Le problème "{ticket.category}" est-il résolu ?
        </p>

        <label style={styles.label}>Votre Note (1 à 5) :</label>
        <div style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => onRatingChange(star)}
              style={{
                cursor: 'pointer',
                fontSize: '24px',
                color: star <= rating ? '#fbbf24' : '#e5e7eb'
              }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Un commentaire sur le service ?"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          style={styles.textarea}
        />

        <div style={styles.modalActions}>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Annuler
          </button>
          <button onClick={onConfirm} style={styles.confirmBtn}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};
