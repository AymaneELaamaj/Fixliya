import React from 'react';

/**
 * Barre de statistiques pour l'historique avec Tailwind CSS
 */
export const HistoryStatsBar = ({ history }) => {
  const validatedCount = history.filter(h => h.status === 'completed' && h.rating).length;
  const pendingCount = history.filter(h => h.status === 'termine_artisan').length;

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-4 md:p-6 mb-6 shadow-medium">
      <div className="flex items-center justify-around divide-x divide-white/30">
        <div className="flex-1 text-center px-3">
          <div className="text-3xl md:text-4xl font-bold mb-1">
            {validatedCount}
          </div>
          <div className="text-xs md:text-sm opacity-90">
            Validées & Notées
          </div>
        </div>
        <div className="flex-1 text-center px-3">
          <div className="text-3xl md:text-4xl font-bold mb-1">
            {pendingCount}
          </div>
          <div className="text-xs md:text-sm opacity-90">
            En attente de validation
          </div>
        </div>
      </div>
    </div>
  );
};
