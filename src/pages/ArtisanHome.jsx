import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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

/**
 * Page d'accueil de l'espace artisan
 */
export default function ArtisanHome() {
  const navigate = useNavigate();

  // Gestion des onglets
  const { activeTab, setActiveTab } = useTabs('todo');

  // Chargement des données
  const { missions, history, loading, loadData } = useArtisanData(navigate);

  // Capture de photos
  const photoCapture = usePhotoCapture(loadData);

  // Déconnexion
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={artisanStyles.pageContainer}>
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        styles={artisanStyles}
      />

      {/* MAIN CONTENT */}
      <main style={artisanStyles.mainContent}>
        <Header
          activeTab={activeTab}
          missionsCount={missions.length}
          historyCount={history.length}
          styles={artisanStyles}
        />

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '16px' }}>
            Chargement...
          </p>
        ) : (
          <>
            {/* Onglet: Ma Journée */}
            {activeTab === 'todo' && (
              <div style={artisanStyles.section}>
                {missions.length === 0 ? (
                  <EmptyState
                    icon="☕"
                    title="Aucune mission active !"
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

            {/* Onglet: Historique */}
            {activeTab === 'history' && (
              <div style={artisanStyles.section}>
                {history.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="Aucune intervention terminée"
                    message="Vos interventions complétées s'afficheront ici"
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

        {/* MODALE DE PHOTOS */}
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
