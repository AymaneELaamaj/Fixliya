import { useState, useRef } from 'react';
import { auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { completeMission, saveBeforePhoto } from '../../services/artisanService';

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
  const [isUploading, setIsUploading] = useState(false);
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
    if (!selectedMission) return;
    
    setIsUploading(true);
    
    try {
      // Mode: seulement photo AVANT (démarrage intervention)
      if (photoMode === 'before-only' && proofPhotos.before) {
        // Upload photo AVANT vers Firebase Storage
        const beforePhotoRef = ref(
          storage, 
          `interventions/${selectedMission.id}/before_${Date.now()}.jpg`
        );
        await uploadBytes(beforePhotoRef, proofPhotos.before.blob);
        const beforePhotoUrl = await getDownloadURL(beforePhotoRef);
        
        // Sauvegarder dans Firestore
        await saveBeforePhoto(selectedMission.id, beforePhotoUrl);
        
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser && onSuccess) {
          await onSuccess(auth.currentUser.uid);
        }
        return;
      }

      // Mode: seulement photo APRÈS (fin intervention)
      if (photoMode === 'after-only' && proofPhotos.after) {
        // Upload photo APRÈS vers Firebase Storage
        const afterPhotoRef = ref(
          storage, 
          `interventions/${selectedMission.id}/after_${Date.now()}.jpg`
        );
        await uploadBytes(afterPhotoRef, proofPhotos.after.blob);
        const afterPhotoUrl = await getDownloadURL(afterPhotoRef);
        
        // Compléter la mission avec notification
        await completeMission(selectedMission.id, {
          afterPhotoUrl: afterPhotoUrl,
          completedAt: new Date().toISOString()
        });
        
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser && onSuccess) {
          await onSuccess(auth.currentUser.uid);
        }
        return;
      }

      // Mode: les deux photos
      if (photoMode === 'both' && proofPhotos.before && proofPhotos.after) {
        // Upload les deux photos
        const beforePhotoRef = ref(
          storage, 
          `interventions/${selectedMission.id}/before_${Date.now()}.jpg`
        );
        const afterPhotoRef = ref(
          storage, 
          `interventions/${selectedMission.id}/after_${Date.now()}.jpg`
        );
        
        await uploadBytes(beforePhotoRef, proofPhotos.before.blob);
        await uploadBytes(afterPhotoRef, proofPhotos.after.blob);
        
        const beforePhotoUrl = await getDownloadURL(beforePhotoRef);
        const afterPhotoUrl = await getDownloadURL(afterPhotoRef);
        
        await completeMission(selectedMission.id, {
          beforePhotoUrl: beforePhotoUrl,
          afterPhotoUrl: afterPhotoUrl,
          completedAt: new Date().toISOString()
        });
        
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser && onSuccess) {
          await onSuccess(auth.currentUser.uid);
        }
      }
    } catch (error) {
      console.error('Erreur upload photos:', error);
      alert('Erreur lors de l\'envoi des photos. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
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
    isUploading,
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
