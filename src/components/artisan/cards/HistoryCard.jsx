import React from 'react';

/**
 * Carte pour afficher un élément de l'historique avec Tailwind CSS
 */
export const HistoryCard = ({ item }) => {
  const displayDate = new Date(
    item.validatedAt || item.completedAt || item.dateFin || item.createdAt
  ).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const completionDate = new Date(
    item.completedAt || item.dateFin || item.validatedAt
  );

  return (
    <div className="card bg-white rounded-xl p-4 shadow-soft hover:shadow-medium transition-shadow">
      {/* En-tête avec catégorie et date */}
      <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
            {item.category}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {displayDate}
          </span>
        </div>
        {item.status === 'completed' ? (
          <span className="badge-success flex-shrink-0">✅ Validée</span>
        ) : (
          <span className="badge-warning flex-shrink-0">⏳ En attente</span>
        )}
      </div>

      {/* Lieu et étudiant */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="text-base">📍</span>
          <span className="font-medium">{item.location || 'Lieu non spécifié'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="text-base">👤</span>
          <span>{item.studentName || 'Étudiant'}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-3">
            {item.description}
          </p>
        </div>
      </div>

      {/* Photos archivées */}
      {(item.beforePhoto || item.afterPhoto) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-3 border border-blue-200">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📸</span>
            <span>Photos de l'intervention</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {item.beforePhoto && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  Avant
                </div>
                <img 
                  src={item.beforePhoto} 
                  alt="Photo avant" 
                  className="w-full aspect-square object-cover rounded-lg border-2 border-orange-300 shadow-md hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(item.beforePhoto, '_blank')}
                />
              </div>
            )}
            {item.afterPhoto && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Après
                </div>
                <img 
                  src={item.afterPhoto} 
                  alt="Photo après" 
                  className="w-full aspect-square object-cover rounded-lg border-2 border-green-300 shadow-md hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(item.afterPhoto, '_blank')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section notation */}
      {item.status === 'completed' && item.rating ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-700">Note du résident :</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">{item.rating}/5</span>
            </div>
          </div>
          {item.studentComment && (
            <div className="bg-white rounded-lg p-3 border border-yellow-300">
              <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <span>💬</span>
                <span>Commentaire :</span>
              </div>
              <p className="text-sm text-gray-700 italic">"{item.studentComment}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <span className="text-sm text-orange-700 font-medium">
            En attente de validation par le résident...
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          ✓ Complétée le {completionDate.toLocaleDateString('fr-FR')} à{' '}
          {completionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
