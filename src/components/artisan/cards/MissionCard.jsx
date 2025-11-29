import React from 'react';

/**
 * Carte pour afficher une mission de l'artisan
 */
export const MissionCard = ({ mission, onStart, onComplete, styles }) => {
  return (
    <div style={styles.missionCard}>
      <div style={styles.cardHeader}>
        <span style={styles.categoryTag}>{mission.category}</span>
        {mission.isUrgent && <span style={styles.urgentBadge}>🚨 URGENT</span>}
        {mission.ticketType === 'planifier' && (
          <span style={styles.planifierBadge}>📅 PLANIFIÉ</span>
        )}
      </div>

      {mission.ticketType === 'planifier' && mission.scheduledDate && (
        <div style={styles.planificationSection}>
          <div style={styles.planificationItem}>📅 {mission.scheduledDate}</div>
          {mission.scheduledTime && (
            <div style={styles.planificationItem}>⏰ {mission.scheduledTime}</div>
          )}
        </div>
      )}

      <div style={styles.locationRow}>📍 {mission.location}</div>
      <p style={styles.description}>{mission.description}</p>
      <div style={styles.studentInfo}>👤 {mission.studentName}</div>

      <div style={styles.buttonGroup}>
        <button onClick={() => onStart(mission)} style={styles.btnStart}>
          ▶️ J'interviens
        </button>
        <button onClick={() => onComplete(mission)} style={styles.btnFinish}>
          ✅ Terminer l'intervention
        </button>
      </div>
    </div>
  );
};
