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
  const [cameraMode, setCameraMode] = useState('before');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      alert('Impossible d\'accéder à la caméra');
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
        setProofPhotos({
          ...proofPhotos,
          [cameraMode]: { url: photoUrl, blob }
        });
        stopCamera();
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const deletePhoto = (type) => {
    setProofPhotos({
      ...proofPhotos,
      [type]: null
    });
  };

  const openProofModal = (mission) => {
    setSelectedMission(mission);
    setShowProofModal(true);
    setProofPhotos({ before: null, after: null });
    setCameraMode('before');
  };

  const submitProof = async () => {
    if (!proofPhotos.before || !proofPhotos.after) {
      alert('Vous devez fournir les deux photos (avant et après)');
      return;
    }

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
                        </div>
                        <div style={styles.locationRow}>📍 {mission.location}</div>
                        <p style={styles.description}>{mission.description}</p>
                        <div style={styles.studentInfo}>👤 {mission.studentName}</div>
                        <button 
                          onClick={() => openProofModal(mission)} 
                          style={styles.btnFinish}
                        >
                          ✅ Terminer l'intervention
                        </button>
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
                {/* Section Avant */}
                <div style={styles.proofSection}>
                  <h3 style={styles.proofTitle}>📷 Photo AVANT</h3>
                  {proofPhotos.before ? (
                    <div style={styles.photoPreview}>
                      <img src={proofPhotos.before.url} style={styles.proofImage} alt="Avant" />
                      <button 
                        style={styles.deletePhotoBtn}
                        onClick={() => deletePhoto('before')}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      {isCameraOpen && cameraMode === 'before' ? (
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
                              onClick={stopCamera}
                            >
                              ✕ Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          style={styles.openCameraBtn}
                          onClick={() => {
                            setCameraMode('before');
                            startCamera();
                          }}
                        >
                          📷 Ouvrir caméra
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Section Après */}
                <div style={styles.proofSection}>
                  <h3 style={styles.proofTitle}>📷 Photo APRÈS</h3>
                  {proofPhotos.after ? (
                    <div style={styles.photoPreview}>
                      <img src={proofPhotos.after.url} style={styles.proofImage} alt="Après" />
                      <button 
                        style={styles.deletePhotoBtn}
                        onClick={() => deletePhoto('after')}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      {isCameraOpen && cameraMode === 'after' ? (
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
                              onClick={stopCamera}
                            >
                              ✕ Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          style={styles.openCameraBtn}
                          onClick={() => {
                            setCameraMode('after');
                            startCamera();
                          }}
                        >
                          📷 Ouvrir caméra
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={styles.submitBtn}
                  onClick={submitProof}
                  disabled={!proofPhotos.before || !proofPhotos.after}
                >
                  ✅ Soumettre l'intervention
                </button>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowProofModal(false)}
                >
                  ✕ Annuler
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
  btnFinish: { 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#16a34a', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '15px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '12px'
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
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
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
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '20px', 
    marginBottom: '20px' 
  },
  proofSection: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  proofTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' },
  cameraContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    backgroundColor: '#f3f4f6', 
    borderRadius: '8px', 
    padding: '10px',
    border: '2px solid #e5e7eb'
  },
  video: { 
    width: '100%', 
    height: '300px', 
    backgroundColor: '#000', 
    borderRadius: '8px', 
    objectFit: 'cover' 
  },
  cameraButtons: { 
    display: 'flex', 
    gap: '8px' 
  },
  captureBtn: { 
    flex: 1, 
    padding: '12px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    fontSize: '14px'
  },
  cancelPhotoBtn: { 
    flex: 1, 
    padding: '12px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    fontSize: '14px'
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
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
    marginTop: '20px'
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
  }
};


