import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// --- IMPORTS POUR NOTIFS ---
import { requestForToken, onMessageListener, db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Hooks
import { useArtisanData, useTabs, usePhotoCapture } from '../hooks/artisans';

// Components
import {
  Sidebar,
  Header,
  EmptyState,
  MissionCard,
  HistoryCard,
  HistoryStatsBar,
  PhotoModal,
  artisanStyles
} from '../components/artisan';

export default function ArtisanHome() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useTabs('todo');
  const { missions, history, loading, loadData } = useArtisanData(navigate);
  const photoCapture = usePhotoCapture(loadData);

  // --- LOGIQUE NOTIFICATION ---
  useEffect(() => {
    onMessageListener().then(payload => {
      // Petit son ou alerte visuelle quand l'artisan a l'app ouverte
      alert(`🔔 Nouvelle mission : ${payload.notification.body}`);
      // On recharge les données pour afficher la nouvelle mission immédiatement
      if (auth.currentUser) {
        loadData(auth.currentUser.uid);
      }
    }).catch(err => console.log('Erreur listener', err));
  }, []);

  // --- FONCTION D'ACTIVATION CORRIGÉE ---
  const enableNotifications = async () => {
    console.log("Tentative d'activation...");
    
    // 1. Demander le token
    const token = await requestForToken();
    
    // 2. Si on a le token, on sauvegarde
    if (token && auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { fcmTokens: arrayUnion(token) });
        alert("✅ Succès ! Votre téléphone recevra les missions.");
      } catch (error) {
        console.error("Erreur sauvegarde token", error);
        alert("❌ Erreur technique lors de la sauvegarde : " + error.message);
      }
    } else {
      // 3. Si pas de token (C'est ici que ça bloquait silencieusement avant)
      alert("❌ Impossible d'activer les notifications.\n\nCauses possibles :\n1. Vous avez cliqué sur 'Bloquer' (Réinitialisez les permissions)\n2. Vous êtes en Navigation Privée\n3. Sur iPhone : L'app n'est pas ajoutée à l'écran d'accueil");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={artisanStyles.pageContainer}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        styles={artisanStyles}
      />

      <main style={artisanStyles.mainContent}>
        
        {/* HEADER MODIFIÉ AVEC LE BOUTON */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <Header
            activeTab={activeTab}
            missionsCount={missions.length}
            historyCount={history.length}
            styles={{...artisanStyles, header: {marginBottom: 0, borderBottom: 'none'}}} 
            />
            
            <button 
            onClick={enableNotifications}
            style={{
                padding: '10px 15px',
                backgroundColor: '#059669', // Vert pour l'artisan
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            >
            🔔 Activer Alertes
            </button>
        </div>
        <div style={{borderBottom: '2px solid #e5e7eb', marginBottom: '30px'}}></div>


        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>Chargement...</p>
        ) : (
          <>
            {activeTab === 'todo' && (
              <div style={artisanStyles.section}>
                {missions.length === 0 ? (
                  <EmptyState
                    icon="☕"
                    title="Aucune mission"
                    message="En attente de dispatch..."
                    styles={artisanStyles}
                  />
                ) : (
                  <div style={artisanStyles.cardGrid}>
                    {missions.map(mission => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        onStart={photoCapture.startInterventionPhotoOnly}
                        onComplete={photoCapture.completeInterventionPhotoOnly}
                        styles={artisanStyles}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div style={artisanStyles.section}>
                {history.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="Historique vide"
                    message="Vos missions terminées apparaîtront ici"
                    styles={artisanStyles}
                  />
                ) : (
                  <>
                    <HistoryStatsBar history={history} styles={artisanStyles} />
                    <div style={artisanStyles.historyGrid}>
                      {history.map(item => (
                        <HistoryCard key={item.id} item={item} styles={artisanStyles} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <PhotoModal
          showModal={photoCapture.showProofModal}
          selectedMission={photoCapture.selectedMission}
          photoMode={photoCapture.photoMode}
          proofPhotos={photoCapture.proofPhotos}
          currentPhotoStep={photoCapture.currentPhotoStep}
          isCameraOpen={photoCapture.isCameraOpen}
          previewPhoto={photoCapture.previewPhoto}
          videoRef={photoCapture.videoRef}
          canvasRef={photoCapture.canvasRef}
          onClose={photoCapture.closeModal}
          onStartCamera={photoCapture.startCamera}
          onCapturePhoto={photoCapture.capturePhoto}
          onConfirmPhoto={photoCapture.confirmPhoto}
          onRetakePhoto={photoCapture.retakePhoto}
          onDeletePhoto={photoCapture.deletePhoto}
          onSubmit={photoCapture.submitProof}
          setCurrentPhotoStep={photoCapture.setCurrentPhotoStep}
          styles={artisanStyles}
        />
      </main>
    </div>
  );
}