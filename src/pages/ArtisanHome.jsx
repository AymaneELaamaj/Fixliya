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
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h1 style={styles.title}>Espace Artisan 🛠️</h1>
        <button onClick={handleLogout} style={styles.logoutLink}>Déconnexion</button>
      </div>

      <div style={styles.tabs}>
        <button 
          style={activeTab === 'todo' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('todo')}
        >
          Ma Journée ({missions.length})
        </button>
        <button 
          style={activeTab === 'history' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('history')}
        >
          Historique & Avis
        </button>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', marginTop: '20px'}}>Chargement...</p>
      ) : (
        <>
          {activeTab === 'todo' && (
            <div style={styles.list}>
              {missions.length === 0 ? (
                <div style={styles.empty}>
                  <h2>Aucune mission active !</h2>
                  <p>En attente de dispatch... ☕</p>
                </div>
              ) : (
                missions.map(mission => (
                  <div key={mission.id} style={styles.card}>
                    <div style={styles.header}>
                      <span style={styles.tag}>{mission.category}</span>
                      {mission.isUrgent && <span style={styles.urgentBadge}>URGENT</span>}
                    </div>
                    <div style={styles.locationRow}>📍 {mission.location}</div>
                    <p style={styles.desc}>{mission.description}</p>
                    <div style={styles.studentInfo}>👤 Étudiant : {mission.studentName}</div>
                    
                    <button 
                      onClick={() => openProofModal(mission)} 
                      style={styles.btnFinish}
                    >
                      ✅ Terminer l'intervention
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={styles.list}>
              {history.length === 0 ? (
                <div style={styles.empty}>Aucun ticket terminé et noté pour l'instant.</div>
              ) : (
                history.map(item => (
                  <div key={item.id} style={styles.historyCard}>
                    <div style={styles.header}>
                      <span style={{fontWeight: 'bold', color: '#333'}}>{item.category}</span>
                      <span style={styles.date}>{new Date(item.validatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={styles.ratingRow}>
                      Note reçue : <strong style={{color: '#d97706', fontSize: '18px'}}>{item.rating}/5 ⭐</strong>
                    </div>

                    {item.studentComment ? (
                      <div style={styles.commentBox}>
                        " {item.studentComment} "
                      </div>
                    ) : (
                      <p style={{fontStyle: 'italic', color: '#999', fontSize: '12px'}}>Aucun commentaire laissé.</p>
                    )}
                  </div>
                ))
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
              <h2>📸 Preuve d'Intervention</h2>
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

      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#005596', margin: 0, fontSize: '28px', fontWeight: 'bold' },
  logoutLink: { background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' },
  tab: { padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontWeight: 'bold' },
  activeTab: { padding: '10px 20px', border: 'none', background: '#e0f2fe', color: '#005596', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },

  empty: { textAlign: 'center', marginTop: '50px', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  tag: { background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' },
  urgentBadge: { background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  locationRow: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
  desc: { color: '#4b5563', marginBottom: '15px', lineHeight: '1.5' },
  studentInfo: { fontSize: '12px', color: '#9ca3af', marginBottom: '15px' },
  btnFinish: { width: '100%', padding: '14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },

  historyCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  date: { fontSize: '12px', color: '#999' },
  ratingRow: { margin: '10px 0' },
  commentBox: { backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', fontStyle: 'italic', color: '#555' },

  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' },

  proofContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  proofSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  proofTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' },

  cameraContainer: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '10px' },
  video: { width: '100%', height: '300px', backgroundColor: '#000', borderRadius: '8px', objectFit: 'cover' },
  cameraButtons: { display: 'flex', gap: '8px' },
  captureBtn: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  cancelPhotoBtn: { flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },

  openCameraBtn: { padding: '12px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },

  photoPreview: { position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6' },
  proofImage: { width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' },
  deletePhotoBtn: { position: 'absolute', bottom: '8px', right: '8px', padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },

  modalFooter: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  submitBtn: { padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  cancelBtn: { padding: '12px 24px', backgroundColor: '#e5e7eb', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};


