import React from 'react';

/**
 * En-tête de la zone de contenu principal avec Tailwind CSS
 */
export const Header = ({ activeTab, missionsCount, historyCount }) => {
  return (
    <header className="mb-6 pb-4 border-b-2 border-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        {activeTab === 'todo' ? '📋 Ma Journée' : '📊 Historique & Avis'}
      </h1>
      <p className="text-sm md:text-base text-gray-600">
        {activeTab === 'todo'
          ? `Vous avez ${missionsCount} intervention(s)`
          : `${historyCount} intervention(s) terminée(s)`}
      </p>
    </header>
  );
};
