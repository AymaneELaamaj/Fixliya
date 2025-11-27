import React, { useState, useEffect, useRef } from 'react';
import { getMyMissions, getArtisanHistory, completeMission } from "../services/artisanService";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function ArtisanHome() {
  const [activeTab, setActiveTab] = useState('todo');
  const [missions, setMissions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofPhotos, setProofPhotos] = useState({ before: null, after: null });
  const [currentPhotoStep, setCurrentPhotoStep] = useState('before'); // 'before' ou 'after'
  const [photoMode, setPhotoMode] = useState('before-only'); // 'before-only', 'after-only', ou 'both'
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Aperçu avant de confirmer
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadData(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      const todoData = await getMyMissions(uid);
      setMissions(todoData);
      const historyData = await getArtisanHistory(uid);
      setHistory(historyData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true); // Ouvrir le rendu d'abord
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Force le démarrage de la vidéo
          videoRef.current.play().catch(err => console.warn('Erreur play:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Erreur caméra:', err);
      setIsCameraOpen(false);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
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
        // Afficher l'aperçu avant de confirmer
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
    
    // Passer à l'étape suivante automatiquement
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
      tracks.forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const deletePhoto = (type) => {
    setProofPhotos({
      ...proofPhotos,
      [type]: null
    });
    // Revenir à cette étape pour reprendre
    if (type === 'before') {
      setCurrentPhotoStep('before');
    }
  };

  const startInterventionPhotoOnly = (mission) => {
    setSelectedMission(mission);
    setShowProofModal(true);
    setProofPhotos({ before: null, after: null });
    setCurrentPhotoStep('before');
    setPhotoMode('before-only'); // Mode: seulement la photo AVANT
    setPreviewPhoto(null);
    setIsCameraOpen(false);
  };

  // Ouvrir modal pour photo APRÈS (Terminer)
  const completeInterventionPhotoOnly = (mission) => {
    setSelectedMission(mission);
    setShowProofModal(true);
    setProofPhotos({ before: null, after: null });
    setCurrentPhotoStep('after');
    setPhotoMode('after-only'); // Mode: seulement la photo APRÈS
    setPreviewPhoto(null);
    setIsCameraOpen(false);
  };

  const submitProof = async () => {
    // Si c'est depuis "J'interviens", elle ne veut que la photo avant
    if (currentPhotoStep === 'before' && proofPhotos.before) {
      alert('Photo d\'intervention AVANT enregistrée! Vous pouvez maintenant intervenir.');
      setShowProofModal(false);
      setProofPhotos({ before: null, after: null });
      return;
    }

    // Si c'est depuis "Terminer", elle ne veut que la photo après
    if (currentPhotoStep === 'after' && proofPhotos.after) {
      if (!selectedMission) return;
      try {
        await completeMission(selectedMission.id, {
          beforePhoto: null,
          afterPhoto: proofPhotos.after.url,
          completedAt: new Date().toISOString()
        });
        alert('Intervention terminée et notification envoyée à l\'étudiant !');
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser) {
          loadData(auth.currentUser.uid);
        }
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la soumission');
      }
      return;
    }

    // Si les deux photos sont prises
    if (proofPhotos.before && proofPhotos.after) {
      if (!selectedMission) return;
      try {
        await completeMission(selectedMission.id, {
          beforePhoto: proofPhotos.before.url,
          afterPhoto: proofPhotos.after.url,
          completedAt: new Date().toISOString()
        });
        alert('Intervention terminée et notification envoyée à l\'étudiant !');
        setShowProofModal(false);
        setProofPhotos({ before: null, after: null });
        if (auth.currentUser) {
          loadData(auth.currentUser.uid);
        }
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la soumission');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={styles.pageContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>🛠️ Artisan</h2>
        </div>
        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab('todo')}
            style={activeTab === 'todo' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            📋 Ma Journée
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            📊 Historique & Avis
          </button>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
          🚪 Déconnexion
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'todo' ? '📋 Ma Journée' : '📊 Historique & Avis'}
          </h1>
          <p style={styles.subtitle}>
            {activeTab === 'todo' ? `Vous avez ${missions.length} intervention(s)` : `${history.length} intervention(s) terminée(s)`}
          </p>
        </header>

        {loading ? (
          <p style={{textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '16px'}}>Chargement...</p>
        ) : (
          <>
            {activeTab === 'todo' && (
              <div style={styles.section}>
                {missions.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>☕</div>
                    <h2>Aucune mission active !</h2>
                    <p>En attente de dispatch...</p>
                  </div>
                ) : (
                  <div style={styles.cardGrid}>
                    {missions.map(mission => (
                      <div key={mission.id} style={styles.missionCard}>
                        <div style={styles.cardHeader}>
                          <span style={styles.categoryTag}>{mission.category}</span>
                          {mission.isUrgent && <span style={styles.urgentBadge}>🚨 URGENT</span>}
                          {mission.ticketType === 'planifier' && <span style={styles.planifierBadge}>📅 PLANIFIÉ</span>}
                        </div>
                        {mission.ticketType === 'planifier' && mission.scheduledDate && (
                          <div style={styles.planificationSection}>
                            <div style={styles.planificationItem}>📅 {mission.scheduledDate}</div>
                            {mission.scheduledTime && <div style={styles.planificationItem}>⏰ {mission.scheduledTime}</div>}
                          </div>
                        )}
                        <div style={styles.locationRow}>📍 {mission.location}</div>
                        <p style={styles.description}>{mission.description}</p>
                        <div style={styles.studentInfo}>👤 {mission.studentName}</div>
                        {/* Deux boutons: J'interviens et Terminer */}
                        <div style={styles.buttonGroup}>
                          <button 
                            onClick={() => startInterventionPhotoOnly(mission)} 
                            style={styles.btnStart}
                          >
                            ▶️ J'interviens
                          </button>
                          <button 
                            onClick={() => completeInterventionPhotoOnly(mission)} 
                            style={styles.btnFinish}
                          >
                            ✅ Terminer l'intervention
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div style={styles.section}>
                {history.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <h2>Aucun ticket terminé</h2>
                    <p>Vos interventions notées s'afficheront ici</p>
                  </div>
                ) : (
                  <div style={styles.historyGrid}>
                    {history.map(item => (
                      <div key={item.id} style={styles.historyCard}>
                        <div style={styles.historyHeader}>
                          <span style={styles.categoryTag}>{item.category}</span>
                          <span style={styles.dateTag}>{new Date(item.validatedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div style={styles.ratingBox}>
                          <span style={styles.ratingLabel}>Note reçue :</span>
                          <span style={styles.ratingValue}>{item.rating}/5 ⭐</span>
                        </div>
                        {item.studentComment ? (
                          <div style={styles.commentBox}>
                            💬 "{item.studentComment}"
                          </div>
                        ) : (
                          <p style={styles.noComment}>Aucun commentaire laissé</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Preuve Avant/Après */}
        {showProofModal && (
          <div style={styles.modalOverlay} onClick={() => setShowProofModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>📸 Preuve d'Intervention</h2>
                <button 
                  style={styles.closeBtn}
                  onClick={() => setShowProofModal(false)}
                >
                  ✕
                </button>
              </div>

              <div style={styles.proofContainer}>
                {/* PHASE 1: PHOTO AVANT - Affichée SEULEMENT si mode 'before-only' ou 'both' */}
                {(photoMode === 'before-only' || photoMode === 'both') && (
                  <div style={styles.phaseContainer}>
                  <div style={styles.phaseHeader}>
                    <h3 style={styles.phaseTitle}>📷 ÉTAPE 1 : Photo AVANT l'intervention</h3>
                    <span style={proofPhotos.before ? styles.phaseComplete : styles.phaseIncomplete}>
                      {proofPhotos.before ? '✅ Complétée' : '⏳ En attente'}
                    </span>
                  </div>

                  {proofPhotos.before ? (
                    // Photo déjà prise
                    <div style={styles.photoConfirmSection}>
                      <img src={proofPhotos.before.url} style={styles.proofImage} alt="Avant" />
                      <div style={styles.photoActionButtons}>
                        <button 
                          style={styles.retakePhotoBtn}
                          onClick={() => deletePhoto('before')}
                        >
                          🔄 Reprendre cette photo
                        </button>
                        {/* Bouton pour continuer SEULEMENT si mode 'both' */}
                        {photoMode === 'both' ? (
                          <button 
                            style={styles.confirmPhotoBtn}
                            onClick={() => setCurrentPhotoStep('after')}
                          >
                            ✅ Valider et continuer
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : previewPhoto && previewPhoto.step === 'before' ? (
                    // Aperçu avant confirmation
                    <div style={styles.previewSection}>
                      <img src={previewPhoto.url} style={styles.proofImage} alt="Aperçu Avant" />
                      <p style={styles.previewText}>Êtes-vous satisfait de cette photo?</p>
                      <div style={styles.previewActionButtons}>
                        <button 
                          style={styles.retakeBtn}
                          onClick={retakePhoto}
                        >
                          ❌ Reprendre la photo
                        </button>
                        <button 
                          style={styles.confirmBtn}
                          onClick={confirmPhoto}
                        >
                          ✅ Confirmer cette photo
                        </button>
                      </div>
                    </div>
                  ) : isCameraOpen && currentPhotoStep === 'before' ? (
                    // Caméra ouverte
                    <div style={styles.cameraContainer}>
                      <video ref={videoRef} style={styles.video} autoPlay playsInline />
                      <div style={styles.cameraButtons}>
                        <button 
                          style={styles.captureBtn}
                          onClick={capturePhoto}
                        >
                          📷 Prendre la photo
                        </button>
                        <button 
                          style={styles.cancelPhotoBtn}
                          onClick={() => {
                            stopCamera();
                            setCurrentPhotoStep('before');
                          }}
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Bouton pour ouvrir caméra
                    <div style={styles.startPhotoSection}>
                      <div style={styles.instructionText}>
                        📍 Prenez une photo du problème/zone AVANT l'intervention
                      </div>
                      <button 
                        style={styles.openCameraBtn}
                        onClick={() => startCamera()}
                      >
                        📷 Ouvrir la caméra
                      </button>
                    </div>
                  )}
                </div>
                )}

                {/* PHASE 2: PHOTO APRÈS - Affichée SEULEMENT si mode 'after-only' ou 'both' ET on est à l'étape 'after' */}
                {(photoMode === 'after-only' || (photoMode === 'both' && currentPhotoStep === 'after')) && (
                  <div style={styles.phaseContainer}>
                    <div style={styles.phaseHeader}>
                      <h3 style={styles.phaseTitle}>📷 ÉTAPE 2 : Photo APRÈS l'intervention</h3>
                      <span style={proofPhotos.after ? styles.phaseComplete : styles.phaseIncomplete}>
                        {proofPhotos.after ? '✅ Complétée' : '⏳ En attente'}
                      </span>
                    </div>

                    {proofPhotos.after ? (
                      // Photo déjà prise
                      <div style={styles.photoConfirmSection}>
                        <img src={proofPhotos.after.url} style={styles.proofImage} alt="Après" />
                        <div style={styles.photoActionButtons}>
                          <button 
                            style={styles.retakePhotoBtn}
                            onClick={() => deletePhoto('after')}
                          >
                            🔄 Reprendre cette photo
                          </button>
                          <button 
                            style={styles.confirmPhotoBtn}
                            onClick={() => {}}
                          >
                            ✅ Photo confirmée
                          </button>
                        </div>
                      </div>
                    ) : previewPhoto && previewPhoto.step === 'after' ? (
                      // Aperçu avant confirmation
                      <div style={styles.previewSection}>
                        <img src={previewPhoto.url} style={styles.proofImage} alt="Aperçu Après" />
                        <p style={styles.previewText}>Êtes-vous satisfait de cette photo?</p>
                        <div style={styles.previewActionButtons}>
                          <button 
                            style={styles.retakeBtn}
                            onClick={retakePhoto}
                          >
                            ❌ Reprendre la photo
                          </button>
                          <button 
                            style={styles.confirmBtn}
                            onClick={confirmPhoto}
                          >
                            ✅ Confirmer cette photo
                          </button>
                        </div>
                      </div>
                    ) : isCameraOpen ? (
                      // Caméra ouverte
                      <div style={styles.cameraContainer}>
                        <video ref={videoRef} style={styles.video} autoPlay playsInline />
                        <div style={styles.cameraButtons}>
                          <button 
                            style={styles.captureBtn}
                            onClick={capturePhoto}
                          >
                            📷 Prendre la photo
                          </button>
                          <button 
                            style={styles.cancelPhotoBtn}
                            onClick={() => {
                              stopCamera();
                              setCurrentPhotoStep('after');
                            }}
                          >
                            ✕ Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Bouton pour ouvrir caméra
                      <div style={styles.startPhotoSection}>
                        <div style={styles.instructionText}>
                          📍 Prenez une photo du travail APRÈS l'intervention
                        </div>
                        <button 
                          style={styles.openCameraBtn}
                          onClick={() => startCamera()}
                        >
                          📷 Ouvrir la caméra
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER: Boutons de soumission */}
              <div style={styles.modalFooter}>
                {/* Si on est en ÉTAPE 1 (photo avant) en mode 'before-only' */}
                {photoMode === 'before-only' && currentPhotoStep === 'before' && proofPhotos.before ? (
                  <button 
                    style={styles.submitBtn}
                    onClick={submitProof}
                  >
                    ✅ Valider et commencer l'intervention
                  </button>
                ) : null}

                {/* Si on est en ÉTAPE 2 (photo après) en mode 'after-only' */}
                {photoMode === 'after-only' && currentPhotoStep === 'after' && proofPhotos.after ? (
                  <button 
                    style={styles.submitBtn}
                    onClick={submitProof}
                  >
                    ✅ Terminer et envoyer les preuves
                  </button>
                ) : null}

                {/* Si on est en mode 'both' et les deux photos sont prises */}
                {photoMode === 'both' && proofPhotos.before && proofPhotos.after ? (
                  <button 
                    style={styles.submitBtn}
                    onClick={submitProof}
                  >
                    ✅ Soumettre l'intervention
                  </button>
                ) : null}

                {/* Message d'attente */}
                {!(
                  (photoMode === 'before-only' && proofPhotos.before) ||
                  (photoMode === 'after-only' && proofPhotos.after) ||
                  (photoMode === 'both' && proofPhotos.before && proofPhotos.after)
                ) ? (
                  <p style={styles.footerHint}>
                    ⏳ Prenez la photo pour continuer...
                  </p>
                ) : null}

                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowProofModal(false)}
                >
                  ✕ Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  pageContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' },
  
  // SIDEBAR
  sidebar: { 
    width: '250px', 
    backgroundColor: '#005596', 
    color: 'white', 
    padding: '20px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto'
  },
  sidebarHeader: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)' },
  sidebarTitle: { margin: 0, fontSize: '24px', fontWeight: 'bold' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' },
  navButton: { 
    padding: '12px 16px', 
    backgroundColor: 'transparent', 
    border: 'none', 
    color: 'rgba(255,255,255,0.7)', 
    cursor: 'pointer', 
    borderRadius: '8px', 
    fontWeight: '600', 
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all 0.3s'
  },
  navButtonActive: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    color: 'white'
  },
  logoutBtnSidebar: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    marginTop: 'auto'
  },

  // MAIN CONTENT
  mainContent: { 
    flex: 1, 
    marginLeft: '250px', 
    padding: '30px', 
    backgroundColor: '#f8fafc'
  },
  header: { marginBottom: '30px' },
  pageTitle: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' },
  subtitle: { fontSize: '16px', color: '#6b7280', margin: 0 },

  section: { marginBottom: '30px' },
  
  // MISSION CARDS
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  missionCard: { 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  categoryTag: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' },
  urgentBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
  locationRow: { fontSize: '16px', fontWeight: '600', color: '#1f2937' },
  description: { color: '#4b5563', lineHeight: '1.5', margin: 0, fontSize: '14px' },
  studentInfo: { fontSize: '13px', color: '#6b7280', marginTop: 'auto' },
  
  // Groupe de boutons
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },
  btnStart: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#0284c7',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  btnFinish: { 
    flex: 1,
    padding: '12px 16px', 
    backgroundColor: '#16a34a', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: 0
  },

  // HISTORY CARDS
  historyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  historyCard: { 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: '5px solid #16a34a',
    border: '1px solid #e5e7eb',
    borderLeftWidth: '5px'
  },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  dateTag: { fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '4px' },
  ratingBox: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' },
  ratingLabel: { fontSize: '13px', fontWeight: '600', color: '#92400e' },
  ratingValue: { fontSize: '18px', fontWeight: 'bold', color: '#d97706' },
  commentBox: { backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', fontStyle: 'italic', color: '#555', fontSize: '14px', borderLeft: '3px solid #d97706' },
  noComment: { fontStyle: 'italic', color: '#999', fontSize: '13px', margin: 0 },

  // EMPTY STATE
  emptyState: { 
    textAlign: 'center', 
    padding: '60px 20px', 
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '15px' },

  // MODAL
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000 
  },
  modal: { 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    padding: '25px', 
    maxWidth: '700px', 
    width: '90%', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.3s ease-out'
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px', 
    borderBottom: '2px solid #e5e7eb', 
    paddingBottom: '15px' 
  },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 },
  closeBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '24px', 
    cursor: 'pointer', 
    color: '#9ca3af',
    transition: 'all 0.3s'
  },

  // PROOF
  proofContainer: { 
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', 
    marginBottom: '20px' 
  },
  phaseContainer: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  },
  phaseTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  phaseComplete: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  phaseIncomplete: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  proofSection: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  proofTitle: { 
    margin: '0 0 10px 0', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  startPhotoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    padding: '30px 20px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '2px dashed #0284c7'
  },
  instructionText: {
    fontSize: '14px',
    color: '#0369a1',
    fontWeight: '600',
    textAlign: 'center'
  },
  cameraContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    backgroundColor: '#000', 
    borderRadius: '8px', 
    padding: '12px',
    border: '2px solid #1f2937'
  },
  video: { 
    width: '100%', 
    height: '400px', 
    backgroundColor: '#000', 
    borderRadius: '6px', 
    objectFit: 'cover',
    display: 'block'
  },
  cameraButtons: { 
    display: 'flex', 
    gap: '10px',
    justifyContent: 'center'
  },
  captureBtn: { 
    flex: 1,
    maxWidth: '300px',
    padding: '14px 20px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s'
  },
  cancelPhotoBtn: { 
    flex: 1,
    maxWidth: '300px',
    padding: '14px 20px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s'
  },
  openCameraBtn: { 
    padding: '14px', 
    backgroundColor: '#005596', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '15px',
    transition: 'all 0.3s'
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#f0f9ff',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #0284c7'
  },
  previewText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#0369a1',
    textAlign: 'center'
  },
  previewActionButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  retakeBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fca5a5',
    color: '#991b1b',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  confirmBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#86efac',
    color: '#15803d',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  photoConfirmSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  photoActionButtons: {
    display: 'flex',
    gap: '10px'
  },
  retakePhotoBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fed7aa',
    color: '#b45309',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  confirmPhotoBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#d1d5db',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  photoPreview: { 
    position: 'relative', 
    borderRadius: '8px', 
    overflow: 'hidden', 
    backgroundColor: '#f3f4f6',
    border: '2px solid #e5e7eb'
  },
  proofImage: { 
    width: '100%', 
    height: '300px', 
    objectFit: 'cover', 
    borderRadius: '8px' 
  },
  deletePhotoBtn: { 
    position: 'absolute', 
    bottom: '10px', 
    right: '10px', 
    padding: '8px 12px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },

  // MODAL FOOTER
  modalFooter: { 
    display: 'flex', 
    gap: '10px', 
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
    marginTop: '20px'
  },
  footerHint: {
    margin: 0,
    flex: 1,
    fontSize: '14px',
    color: '#b45309',
    fontWeight: '600'
  },
  submitBtn: { 
    padding: '12px 24px', 
    backgroundColor: '#16a34a', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  cancelBtn: { 
    padding: '12px 24px', 
    backgroundColor: '#e5e7eb', 
    color: '#333', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  planifierBadge: {
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #bae6fd'
  },
  planificationSection: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '10px 12px',
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  planificationItem: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0369a1'
  }
};


