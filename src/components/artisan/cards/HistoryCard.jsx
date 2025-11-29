import React from 'react';

/**
 * Carte pour afficher un élément de l'historique
 */
export const HistoryCard = ({ item, styles }) => {
  const displayDate = new Date(
    item.validatedAt || item.completedAt || item.dateFin || item.createdAt
  ).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const completionDate = new Date(
    item.completedAt || item.dateFin || item.validatedAt
  );

  return (
    <div style={styles.historyCard}>
      {/* En-tête avec catégorie et date */}
      <div style={styles.historyHeader}>
        <div style={styles.historyHeaderLeft}>
          <span style={styles.categoryTag}>{item.category}</span>
          <span style={styles.dateTag}>{displayDate}</span>
        </div>
        {item.status === 'completed' ? (
          <span style={styles.archivedBadge}>✅ Validée</span>
        ) : (
          <span style={styles.pendingBadge}>⏳ En attente</span>
        )}
      </div>

      {/* Lieu et description */}
      <div style={styles.historyDetails}>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📍</span>
          <span style={styles.detailText}>{item.location || 'Lieu non spécifié'}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>👤</span>
          <span style={styles.detailText}>{item.studentName || 'Étudiant'}</span>
        </div>
        <div style={styles.descriptionBox}>
          <p style={styles.descriptionText}>{item.description}</p>
        </div>
      </div>

      {/* Photos archivées */}
      {(item.beforePhoto || item.afterPhoto) && (
        <div style={styles.photoArchiveSection}>
          <h4 style={styles.photoArchiveTitle}>📸 Photos de l'intervention</h4>
          <div style={styles.photoGrid}>
            {item.beforePhoto && (
              <div style={styles.photoCard}>
                <div style={styles.photoLabel}>AVANT</div>
                <img src={item.beforePhoto} style={styles.archivePhoto} alt="Photo avant" />
              </div>
            )}
            {item.afterPhoto && (
              <div style={styles.photoCard}>
                <div style={styles.photoLabel}>APRÈS</div>
                <img src={item.afterPhoto} style={styles.archivePhoto} alt="Photo après" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section notation - affichée seulement si validée */}
      {item.status === 'completed' && item.rating ? (
        <div style={styles.ratingSection}>
          <div style={styles.ratingBox}>
            <span style={styles.ratingLabel}>Note du résident :</span>
            <div style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{ color: i < item.rating ? '#fbbf24' : '#e5e7eb', fontSize: '20px' }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <span style={styles.ratingValue}>{item.rating}/5</span>
          </div>
          {item.studentComment && (
            <div style={styles.commentBox}>
              <div style={styles.commentLabel}>💬 Commentaire :</div>
              <p style={styles.commentText}>"{item.studentComment}"</p>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.pendingValidationBox}>
          <span style={styles.pendingIcon}>⏳</span>
          <span style={styles.pendingText}>En attente de validation par le résident...</span>
        </div>
      )}

      {/* Timestamp */}
      <div style={styles.timestampBox}>
        <span style={styles.timestampText}>
          ✓ Complétée le {completionDate.toLocaleDateString('fr-FR')} à{' '}
          {completionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
