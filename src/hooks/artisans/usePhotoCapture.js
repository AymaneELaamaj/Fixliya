import { useState, useRef } from 'react';
import { auth } from '../../firebase';
import { completeMission } from '../../services/artisanService';

/**
 * Hook pour gérer la capture de photos avant/après l'intervention
 */
export const usePhotoCapture = (onSuccess) => {
  const [selectedMission, setSelectedMission] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofPhotos, setProofPhotos] = useState({ before: null, after: null });
  const [currentPhotoStep, setCurrentPhotoStep] = useState('before');
  const [photoMode, setPhotoMode] = useState('before-only');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.warn('Erreur play:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Erreur caméra:', err);
      setIsCameraOpen(false);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const photoUrl = URL.createObjectURL(blob);
        setPreviewPhoto({ url: photoUrl, blob, step: currentPhotoStep });
        stopCamera();
      });
    }
  };

  const confirmPhoto = () => {
    if (!previewPhoto) return;

    setProofPhotos({
      ...proofPhotos,
      [previewPhoto.step]: previewPhoto
    });

    if (previewPhoto.step === 'before') {
      setCurrentPhotoStep('after');
    }

    setPreviewPhoto(null);
  };

  const retakePhoto = () => {
    setPreviewPhoto(null);
    startCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const deletePhoto = (type) => {
    setProofPhotos({
      ...proofPhotos,
      [type]: null
    });
    if (type === 'before') {
      setCurrentPhotoStep('before');
    }
  };

  const startInterventionPhotoOnly = (mission) => {
    setSelectedMission(mission);
    setShowProofModal(true);
    setProofPhotos({ before: null, after: null });
    setCurrentPhotoStep('before');
    setPhotoMode('before-only');
    setPreviewPhoto(null);
    setIsCameraOpen(false);
  };

  const completeInterventionPhotoOnly = (mission) => {
    setSelectedMission(mission);
    setShowProofModal(true);
    setProofPhotos({ before: null, after: null });
    setCurrentPhotoStep('after');
    setPhotoMode('after-only');
    setPreviewPhoto(null);
    setIsCameraOpen(false);
  };

  const submitProof = async () => {
    // Mode: seulement photo AVANT
    if (photoMode === 'before-only' && proofPhotos.before) {
      alert("✅ Photo d'intervention AVANT enregistrée localement! Vous pouvez maintenant intervenir.");
      setShowProofModal(false);
      setProofPhotos({ before: null, after: null });
      return;
    }

    // Mode: seulement photo APRÈS
    if (photoMode === 'after-only' && proofPhotos.after) {
      if (!selectedMission) return;
      try {
        await completeMission(selectedMission.id, {
          afterPhoto: proofPhotos.after.url,
          completedAt: new Date().toISOString()
        });
        alert("✅ Intervention terminée! Les preuves ont été envoyées à l'étudiant pour validation.");
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser && onSuccess) {
          await onSuccess(auth.currentUser.uid);
        }
      } catch (error) {
        console.error(error);
        alert('❌ Erreur lors de la soumission');
      }
      return;
    }

    // Mode: les deux photos
    if (photoMode === 'both' && proofPhotos.before && proofPhotos.after) {
      if (!selectedMission) return;
      try {
        await completeMission(selectedMission.id, {
          afterPhoto: proofPhotos.after.url,
          completedAt: new Date().toISOString()
        });
        alert("✅ Intervention terminée! Les preuves ont été envoyées à l'étudiant pour validation.");
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser && onSuccess) {
          await onSuccess(auth.currentUser.uid);
        }
      } catch (error) {
        console.error(error);
        alert('❌ Erreur lors de la soumission');
      }
    }
  };

  const closeModal = () => {
    setShowProofModal(false);
    stopCamera();
  };

  return {
    selectedMission,
    showProofModal,
    proofPhotos,
    currentPhotoStep,
    photoMode,
    isCameraOpen,
    previewPhoto,
    videoRef,
    canvasRef,
    setCurrentPhotoStep,
    startCamera,
    capturePhoto,
    confirmPhoto,
    retakePhoto,
    stopCamera,
    deletePhoto,
    startInterventionPhotoOnly,
    completeInterventionPhotoOnly,
    submitProof,
    closeModal
  };
};
