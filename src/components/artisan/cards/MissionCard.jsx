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
      
      {/* Afficher les photos si présentes */}
      {mission.imageUrls && mission.imageUrls.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#374151',
            margin: '0 0 10px 0'
          }}>
            📷 Photos du problème ({mission.imageUrls.length})
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {mission.imageUrls.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Photo ${index + 1}`} 
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '2px solid #e5e7eb'
                }}
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Afficher l'audio si présent */}
      {mission.audioUrl && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#374151',
            margin: '0 0 10px 0'
          }}>
            🎙️ Message vocal du résident
          </p>
          <audio 
            controls 
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '6px'
            }}
          >
            <source src={mission.audioUrl} type="audio/mp3" />
            Votre navigateur ne supporte pas l'audio.
          </audio>
        </div>
      )}
      
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
