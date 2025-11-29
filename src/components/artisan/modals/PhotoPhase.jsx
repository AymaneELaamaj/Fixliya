import React from 'react';

/**
 * Composant pour une phase de capture de photo (avant ou après)
 */
export const PhotoPhase = ({
  title,
  step,
  instruction,
  photo,
  preview,
  isCameraOpen,
  photoMode,
  videoRef,
  onStartCamera,
  onCapture,
  onConfirm,
  onRetake,
  onDelete,
  onContinue,
  styles
}) => {
  return (
    <div style={styles.phaseContainer}>
      <div style={styles.phaseHeader}>
        <h3 style={styles.phaseTitle}>{title}</h3>
        <span style={photo ? styles.phaseComplete : styles.phaseIncomplete}>
          {photo ? '✅ Complétée' : '⏳ En attente'}
        </span>
      </div>

      {photo ? (
        // Photo déjà prise
        <div style={styles.photoConfirmSection}>
          <img src={photo.url} style={styles.proofImage} alt={step} />
          <div style={styles.photoActionButtons}>
            <button style={styles.retakePhotoBtn} onClick={onDelete}>
              🔄 Reprendre cette photo
            </button>
            {photoMode === 'both' && step === 'before' && onContinue && (
              <button style={styles.confirmPhotoBtn} onClick={onContinue}>
                ✅ Valider et continuer
              </button>
            )}
          </div>
        </div>
      ) : preview ? (
        // Aperçu avant confirmation
        <div style={styles.previewSection}>
          <img src={preview.url} style={styles.proofImage} alt={`Aperçu ${step}`} />
          <p style={styles.previewText}>Êtes-vous satisfait de cette photo?</p>
          <div style={styles.previewActionButtons}>
            <button style={styles.retakeBtn} onClick={onRetake}>
              ❌ Reprendre la photo
            </button>
            <button style={styles.confirmBtn} onClick={onConfirm}>
              ✅ Confirmer cette photo
            </button>
          </div>
        </div>
      ) : isCameraOpen ? (
        // Caméra ouverte
        <div style={styles.cameraContainer}>
          <video ref={videoRef} style={styles.video} autoPlay playsInline />
          <div style={styles.cameraButtons}>
            <button style={styles.captureBtn} onClick={onCapture}>
              📷 Prendre la photo
            </button>
            <button
              style={styles.cancelPhotoBtn}
              onClick={() => {
                // Logic handled by parent
              }}
            >
              ✕ Annuler
            </button>
          </div>
        </div>
      ) : (
        // Bouton pour ouvrir caméra
        <div style={styles.startPhotoSection}>
          <div style={styles.instructionText}>{instruction}</div>
          <button style={styles.openCameraBtn} onClick={onStartCamera}>
            📷 Ouvrir la caméra
          </button>
        </div>
      )}
    </div>
  );
};
