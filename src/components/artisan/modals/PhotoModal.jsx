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
  styles,
  isMobile = false,
  isUploading = false
}) => {
  if (!showModal) return null;

  const canSubmit =
    (photoMode === 'before-only' && proofPhotos.before) ||
    (photoMode === 'after-only' && proofPhotos.after) ||
    (photoMode === 'both' && proofPhotos.before && proofPhotos.after);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div 
        style={{
          ...styles.modal,
          width: isMobile ? '95%' : '700px',
          maxWidth: isMobile ? '95%' : '700px',
          padding: isMobile ? '15px' : '25px',
          maxHeight: isMobile ? '90vh' : '85vh',
          overflowY: 'auto'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 style={{
            ...styles.modalTitle,
            fontSize: isMobile ? '18px' : '22px'
          }}>
            📸 Preuve d'Intervention
          </h2>
          <button 
            style={{
              ...styles.closeBtn,
              fontSize: isMobile ? '24px' : '28px',
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px'
            }} 
            onClick={onClose}
          >
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
              isMobile={isMobile}
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
              isMobile={isMobile}
            />
          )}
        </div>

        {/* FOOTER: Boutons de soumission */}
        <div style={styles.modalFooter}>
          {canSubmit ? (
            <button 
              style={{
                ...styles.submitBtn,
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '14px 20px' : '15px 30px',
                opacity: isUploading ? 0.6 : 1,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }} 
              onClick={onSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Envoi en cours...
                </span>
              ) : (
                <>
                  {photoMode === 'before-only' && '✅ Valider et commencer l\'intervention'}
                  {photoMode === 'after-only' && '✅ Terminer et envoyer les preuves'}
                  {photoMode === 'both' && '✅ Soumettre l\'intervention'}
                </>
              )}
            </button>
          ) : (
            <p style={{
              ...styles.footerHint,
              fontSize: isMobile ? '13px' : '14px'
            }}>
              ⏳ Prenez la photo pour continuer...
            </p>
          )}
          <button 
            style={{
              ...styles.cancelBtn,
              fontSize: isMobile ? '13px' : '14px',
              padding: isMobile ? '10px 16px' : '12px 20px'
            }} 
            onClick={onClose}
          >
            ✕ Fermer
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
