import React, { useState, useEffect } from 'react';

/**
 * Carte pour afficher une mission de l'artisan avec Tailwind CSS
 */
export const MissionCard = ({ mission, onStart, onComplete }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasBeforePhoto = !!mission.beforePhotoUrl;
  const canComplete = hasBeforePhoto;

  return (
    <div className={`
      card-interactive
      ${isMobile ? 'p-4' : 'p-5'}
    `}>
      {/* En-tête avec badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
          {mission.category}
        </span>
        {mission.isUrgent && (
          <span className="inline-flex items-center px-3 py-1 bg-danger text-white text-xs font-bold rounded-full animate-pulse">
            🚨 URGENT
          </span>
        )}
        {mission.ticketType === 'planifier' && (
          <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
            📅 PLANIFIÉ
          </span>
        )}
      </div>

      {/* Planification si applicable */}
      {mission.ticketType === 'planifier' && mission.scheduledDate && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
            <span>📅 {mission.scheduledDate}</span>
            {mission.scheduledTime && (
              <>
                <span>•</span>
                <span>⏰ {mission.scheduledTime}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Localisation et description */}
      <div className="flex items-start gap-2 mb-2 text-gray-700">
        <span className="text-lg">📍</span>
        <span className="text-sm md:text-base font-medium">{mission.location}</span>
      </div>
      <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
        {mission.description}
      </p>
      
      {/* Photos du résident */}
      {mission.imageUrls && mission.imageUrls.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
          <p className={`font-bold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            📷 Photos du résident ({mission.imageUrls.length})
          </p>
          <div className={`
            grid gap-2
            ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}
          `}>
            {mission.imageUrls.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Photo résident ${index + 1}`} 
                className="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-primary transition-colors"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio du résident */}
      {mission.audioUrl && (
        <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
          <p className={`font-bold text-purple-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            🎙️ Message vocal du résident
          </p>
          <audio 
            controls 
            className={`w-full rounded-lg ${isMobile ? 'h-8' : 'h-9'}`}
          >
            <source src={mission.audioUrl} type="audio/mp3" />
            Votre navigateur ne supporte pas l'audio.
          </audio>
        </div>
      )}

      {/* Photo AVANT intervention (si prise) */}
      {hasBeforePhoto && (
        <div className="bg-green-50 rounded-lg p-3 mb-3 border-2 border-green-500">
          <p className={`
            font-bold text-green-700 mb-2 flex items-center gap-2
            ${isMobile ? 'text-xs' : 'text-sm'}
          `}>
            <span>✅</span>
            <span>Photo AVANT prise</span>
          </p>
          <img 
            src={mission.beforePhotoUrl} 
            alt="Photo avant intervention" 
            className="w-full max-w-sm rounded-lg cursor-pointer border-2 border-green-500 hover:scale-105 transition-transform"
            onClick={() => window.open(mission.beforePhotoUrl, '_blank')}
          />
        </div>
      )}
      
      {/* Nom de l'étudiant */}
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 pb-3 border-b border-gray-200">
        <span>👤</span>
        <span>{mission.studentName}</span>
      </div>

      {/* Boutons d'action */}
      <div className={`
        flex gap-3
        ${isMobile ? 'flex-col' : 'flex-row'}
      `}>
        {!hasBeforePhoto && (
          <button 
            onClick={() => onStart(mission)} 
            className={`
              bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg
              shadow-md hover:shadow-lg transition-all duration-200 active:scale-95
              ${isMobile ? 'w-full py-3.5 text-base' : 'flex-1 py-3 text-sm'}
            `}
          >
            📸 Prendre photo AVANT
          </button>
        )}
        <button 
          onClick={() => onComplete(mission)} 
          disabled={!canComplete}
          className={`
            font-semibold rounded-lg shadow-md transition-all duration-200
            ${canComplete 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg active:scale-95' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
            }
            ${isMobile ? 'w-full py-3.5 text-base' : 'flex-1 py-3 text-sm'}
          `}
        >
          {hasBeforePhoto ? '📸 Photo APRÈS & Terminer' : '🔒 Prendre photo AVANT d\'abord'}
        </button>
      </div>
    </div>
  );
};
