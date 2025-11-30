import React from 'react';

/**
 * Modale pour valider et noter un ticket avec Tailwind CSS
 */
export const ValidationModal = ({
  ticket,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onConfirm,
  onCancel
}) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-strong max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-2xl">
          <h3 className="text-xl md:text-2xl font-bold m-0">
            ✅ Validation de l'intervention
          </h3>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Photos avant/après */}
          {(ticket.beforePhoto || ticket.afterPhoto) && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📸</span>
                <span>Preuve du travail</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticket.beforePhoto && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Avant</p>
                    <img
                      src={ticket.beforePhoto}
                      alt="Avant intervention"
                      className="w-full h-48 object-cover rounded-lg border-2 border-orange-300 shadow-md"
                    />
                  </div>
                )}
                {ticket.afterPhoto && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Après</p>
                    <img
                      src={ticket.afterPhoto}
                      alt="Après intervention"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-300 shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question de validation */}
          <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-base md:text-lg text-gray-800 font-medium">
              Le problème <span className="font-bold text-primary">"{ticket.category}"</span> est-il résolu ?
            </p>
          </div>

          {/* Notation par étoiles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Votre Note (1 à 5) :
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  className={`
                    text-4xl transition-all duration-200 transform hover:scale-125
                    ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                  `}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 5 ? '⭐ Excellent !' : rating === 4 ? '👍 Très bien' : rating === 3 ? '👌 Bien' : rating === 2 ? '😐 Moyen' : '👎 Insuffisant'}
              </p>
            )}
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre commentaire (optionnel) :
            </label>
            <textarea
              placeholder="Partagez votre expérience avec l'artisan..."
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={rating === 0}
            className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};
