import React from 'react';
import { PhotoPhase } from './PhotoPhase';

/**
 * Modale pour capturer les photos avant/après intervention
 */
export const PhotoModal = ({
  showModal,
  selectedMission,
  photoMode,
  proofPhotos,
  currentPhotoStep,
  isCameraOpen,
  previewPhoto,
  videoRef,
  canvasRef,
  onClose,
  onStartCamera,
  onCapturePhoto,
  onConfirmPhoto,
  onRetakePhoto,
  onDeletePhoto,
  onSubmit,
  setCurrentPhotoStep,
  styles
}) => {
  if (!showModal) return null;

  const canSubmit =
    (photoMode === 'before-only' && proofPhotos.before) ||
    (photoMode === 'after-only' && proofPhotos.after) ||
    (photoMode === 'both' && proofPhotos.before && proofPhotos.after);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>📸 Preuve d'Intervention</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.proofContainer}>
          {/* PHASE 1: PHOTO AVANT */}
          {(photoMode === 'before-only' || photoMode === 'both') && (
            <PhotoPhase
              title="📷 ÉTAPE 1 : Photo AVANT l'intervention"
              step="before"
              instruction="📍 Prenez une photo du problème/zone AVANT l'intervention"
              photo={proofPhotos.before}
              preview={previewPhoto?.step === 'before' ? previewPhoto : null}
              isCameraOpen={isCameraOpen && currentPhotoStep === 'before'}
              photoMode={photoMode}
              videoRef={videoRef}
              onStartCamera={onStartCamera}
              onCapture={onCapturePhoto}
              onConfirm={onConfirmPhoto}
              onRetake={onRetakePhoto}
              onDelete={() => onDeletePhoto('before')}
              onContinue={() => setCurrentPhotoStep('after')}
              styles={styles}
            />
          )}

          {/* PHASE 2: PHOTO APRÈS */}
          {(photoMode === 'after-only' || (photoMode === 'both' && currentPhotoStep === 'after')) && (
            <PhotoPhase
              title="📷 ÉTAPE 2 : Photo APRÈS l'intervention"
              step="after"
              instruction="📍 Prenez une photo du travail APRÈS l'intervention"
              photo={proofPhotos.after}
              preview={previewPhoto?.step === 'after' ? previewPhoto : null}
              isCameraOpen={isCameraOpen}
              photoMode={photoMode}
              videoRef={videoRef}
              onStartCamera={onStartCamera}
              onCapture={onCapturePhoto}
              onConfirm={onConfirmPhoto}
              onRetake={onRetakePhoto}
              onDelete={() => onDeletePhoto('after')}
              styles={styles}
            />
          )}
        </div>

        {/* FOOTER: Boutons de soumission */}
        <div style={styles.modalFooter}>
          {canSubmit ? (
            <button style={styles.submitBtn} onClick={onSubmit}>
              {photoMode === 'before-only' && '✅ Valider et commencer l\'intervention'}
              {photoMode === 'after-only' && '✅ Terminer et envoyer les preuves'}
              {photoMode === 'both' && '✅ Soumettre l\'intervention'}
            </button>
          ) : (
            <p style={styles.footerHint}>⏳ Prenez la photo pour continuer...</p>
          )}
          <button style={styles.cancelBtn} onClick={onClose}>
            ✕ Fermer
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
