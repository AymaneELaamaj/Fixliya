import React, { useState, useEffect } from 'react';

/**
 * Carte pour afficher une mission de l'artisan
 */
export const MissionCard = ({ mission, onStart, onComplete, styles }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasBeforePhoto = !!mission.beforePhotoUrl;
  const canComplete = hasBeforePhoto; // Peut terminer seulement si photo avant prise

  return (
    <div style={{
      ...styles.missionCard,
      padding: isMobile ? '15px' : '20px'
    }}>
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
      
      {/* Afficher les photos du résident si présentes */}
      {mission.imageUrls && mission.imageUrls.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: isMobile ? '10px' : '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '700',
            color: '#374151',
            margin: '0 0 10px 0'
          }}>
            📷 Photos du résident ({mission.imageUrls.length})
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '6px' : '8px'
          }}>
            {mission.imageUrls.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Photo résident ${index + 1}`} 
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

      {/* Afficher l'audio du résident si présent */}
      {mission.audioUrl && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: isMobile ? '10px' : '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
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
              height: isMobile ? '32px' : '36px',
              borderRadius: '6px'
            }}
          >
            <source src={mission.audioUrl} type="audio/mp3" />
            Votre navigateur ne supporte pas l'audio.
          </audio>
        </div>
      )}

      {/* Photo AVANT intervention (si prise) */}
      {hasBeforePhoto && (
        <div style={{
          backgroundColor: '#ecfdf5',
          padding: isMobile ? '10px' : '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '2px solid #10b981'
        }}>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '700',
            color: '#059669',
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ✅ Photo AVANT prise
          </p>
          <img 
            src={mission.beforePhotoUrl} 
            alt="Photo avant intervention" 
            style={{
              width: '100%',
              maxWidth: '300px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '2px solid #10b981'
            }}
            onClick={() => window.open(mission.beforePhotoUrl, '_blank')}
          />
        </div>
      )}
      
      <div style={styles.studentInfo}>👤 {mission.studentName}</div>

      <div style={{
        ...styles.buttonGroup,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '10px'
      }}>
        {!hasBeforePhoto && (
          <button 
            onClick={() => onStart(mission)} 
            style={{
              ...styles.btnStart,
              width: isMobile ? '100%' : 'auto',
              padding: isMobile ? '14px' : '12px 20px',
              fontSize: isMobile ? '15px' : '14px'
            }}
          >
            📸 Prendre photo AVANT
          </button>
        )}
        <button 
          onClick={() => onComplete(mission)} 
          disabled={!canComplete}
          style={{
            ...styles.btnFinish,
            width: isMobile ? '100%' : 'auto',
            padding: isMobile ? '14px' : '12px 20px',
            fontSize: isMobile ? '15px' : '14px',
            opacity: canComplete ? 1 : 0.5,
            cursor: canComplete ? 'pointer' : 'not-allowed',
            backgroundColor: canComplete ? '#10b981' : '#9ca3af'
          }}
        >
          {hasBeforePhoto ? '📸 Photo APRÈS & Terminer' : '🔒 Prendre photo AVANT d\'abord'}
        </button>
      </div>
    </div>
  );
};
