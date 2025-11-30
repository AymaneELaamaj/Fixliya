import React from 'react';
import { getStatusInfo } from '../utils/statusHelpers';

/**
 * Carte pour afficher un ticket individuel - Version Tailwind CSS
 */
export default function TicketCard({ ticket, onValidate, onCancel, onArchive, canArchive }) {
  const statusInfo = getStatusInfo(ticket.status);
  
  // Vérifier si le ticket est récent (moins de 24h)
  const isNew = () => {
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div className="card relative overflow-hidden transform hover:scale-[1.01] transition-all duration-200">
      {/* Indicateur urgent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.isUrgent ? 'bg-danger' : 'bg-gray-200'}`} />

      <div className="p-4 md:p-5">
        {/* Header avec badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs font-semibold">
              {ticket.category}
            </span>
            
            {ticket.isUrgent && (
              <span className="badge-danger">
                ⚠️ URGENT
              </span>
            )}
            
            {isNew() && !ticket.archived && (
              <span className="inline-flex items-center px-2 py-1 bg-info bg-opacity-10 text-info rounded-full text-xs font-semibold">
                ✨ Nouveau
              </span>
            )}
            
            {ticket.archived && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-400 bg-opacity-20 text-gray-600 rounded-full text-xs font-semibold">
                📦 Archivé
              </span>
            )}
          </div>
          
          <span 
            className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.color
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm md:text-base mb-3 line-clamp-3">
          {ticket.description}
        </p>

        {/* Localisation */}
        <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
          <span>📍</span>
          <span>{ticket.location}</span>
        </p>

        {/* Photos si présentes */}
        {ticket.imageUrls && ticket.imageUrls.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              📷 Photos ({ticket.imageUrls.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ticket.imageUrls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(url, '_blank');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Audio si présent */}
        {ticket.audioUrl && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              🎙️ Message vocal
            </p>
            <audio 
              controls 
              className="w-full h-10"
              onClick={(e) => e.stopPropagation()}
            >
              <source src={ticket.audioUrl} type="audio/mp3" />
              Votre navigateur ne supporte pas l'audio.
            </audio>
          </div>
        )}

        {/* Preuves artisan si présentes */}
        {(ticket.beforePhotoUrl || ticket.afterPhotoUrl) && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-xs font-semibold text-green-700 mb-2">
              🛠️ Preuves d'intervention
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ticket.beforePhotoUrl && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Avant</p>
                  <img 
                    src={ticket.beforePhotoUrl} 
                    alt="Avant intervention" 
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-orange-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(ticket.beforePhotoUrl, '_blank');
                    }}
                  />
                </div>
              )}
              {ticket.afterPhotoUrl && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Après</p>
                  <img 
                    src={ticket.afterPhotoUrl} 
                    alt="Après intervention" 
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-green-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(ticket.afterPhotoUrl, '_blank');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Artisan assigné */}
        {ticket.assignedToName && (
          <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
            <span>👨‍🔧</span>
            <span>Assigné à : <span className="font-semibold">{ticket.assignedToName}</span></span>
          </p>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bouton de validation */}
            {ticket.status === 'termine_artisan' && onValidate && (
              <button 
                onClick={() => onValidate(ticket)} 
                className="px-4 py-2 bg-gradient-to-r from-success to-green-600 text-white rounded-lg text-sm font-semibold hover:shadow-medium transition-all active:scale-95"
              >
                ⭐ Valider & Noter
              </button>
            )}

            {/* Afficher la note */}
            {ticket.status === 'completed' && ticket.rating && (
              <span className="px-3 py-1.5 bg-warning bg-opacity-10 text-warning rounded-lg text-sm font-semibold flex items-center gap-1">
                <span>Note : {ticket.rating}/5</span>
                <span>⭐</span>
              </span>
            )}

            {/* Bouton d'annulation */}
            {(ticket.status === 'pending' || ticket.status === 'in_progress') && onCancel && (
              <button
                onClick={() => onCancel(ticket)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors active:scale-95"
              >
                ✕ Annuler
              </button>
            )}

            {/* Bouton d'archivage */}
            {canArchive && canArchive(ticket) && onArchive && (
              <button
                onClick={() => onArchive(ticket.id)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors active:scale-95"
                title="Archiver cette réclamation"
              >
                📦
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
