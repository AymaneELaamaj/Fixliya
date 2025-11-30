import React from 'react';

/**
 * Composant pour afficher un état vide avec Tailwind CSS
 */
export const EmptyState = ({ icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl shadow-soft">
      <div className="text-7xl md:text-8xl mb-6 animate-fade-in">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
        {title}
      </h2>
      <p className="text-sm md:text-base text-gray-600 max-w-md">
        {message}
      </p>
    </div>
  );
};
