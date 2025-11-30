import React, { useState, useEffect } from 'react';
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
 * Page d'accueil de l'espace artisan avec Tailwind CSS
 */
export default function ArtisanHome() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Gestion responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        styles={artisanStyles}
        isMobile={isMobile}
      />

      {/* MAIN CONTENT */}
      <main className={`
        flex-1 transition-all duration-300
        ${isMobile ? 'ml-0 p-4 pb-20' : 'ml-64 p-8'}
      `}>
        <Header
          activeTab={activeTab}
          missionsCount={missions.length}
          historyCount={history.length}
          styles={artisanStyles}
          isMobile={isMobile}
        />

        {loading ? (
          <div className="flex items-center justify-center mt-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Chargement...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Onglet: Ma Journée */}
            {activeTab === 'todo' && (
              <div className="mt-6">
                {missions.length === 0 ? (
                  <EmptyState
                    icon="☕"
                    title="Aucune mission active !"
                    message="En attente de dispatch..."
                    styles={artisanStyles}
                    isMobile={isMobile}
                  />
                ) : (
                  <div className={`
                    grid gap-5
                    ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'}
                  `}>
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
              <div className="mt-6">
                {history.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="Aucune intervention terminée"
                    message="Vos interventions complétées s'afficheront ici"
                    styles={artisanStyles}
                    isMobile={isMobile}
                  />
                ) : (
                  <>
                    <HistoryStatsBar 
                      history={history} 
                      styles={artisanStyles} 
                      isMobile={isMobile} 
                    />
                    <div className={`
                      grid gap-4 mt-5
                      ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
                    `}>
                      {history.map(item => (
                        <HistoryCard 
                          key={item.id} 
                          item={item} 
                          styles={artisanStyles} 
                        />
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
          isMobile={isMobile}
          isUploading={photoCapture.isUploading}
        />
      </main>
    </div>
  );
}
