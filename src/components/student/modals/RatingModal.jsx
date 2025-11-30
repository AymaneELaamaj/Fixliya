import React, { useState } from 'react';

/**
 * Composant de notation d'intervention (Étoiles + Commentaire)
 */
export default function RatingModal({ 
  show, 
  ticket, 
  onClose, 
  onSubmit,
  isSubmitting = false
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Veuillez sélectionner une note avant de soumettre');
      return;
    }
    onSubmit({ rating, comment });
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    onClose();
  };

  return (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          color: 'white'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px',
            fontWeight: '700'
          }}>
            ⭐ Évaluer l'intervention
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Ticket Info */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            📍 {ticket.location}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            🔧 {ticket.category}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            👨‍🔧 Artisan : {ticket.assignedToName || 'N/A'}
          </div>
        </div>

        {/* Rating Stars */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            opacity: 0.95
          }}>
            Notez la qualité de l'intervention :
          </div>
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            padding: '15px 0'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '48px',
                  transition: 'transform 0.2s',
                  transform: (hoverRating >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
              >
                {(hoverRating >= star || rating >= star) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '700',
            marginTop: '10px'
          }}>
            {rating > 0 ? `${rating}/5 étoiles` : 'Cliquez pour noter'}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            opacity: 0.95
          }}>
            Commentaire (optionnel) :
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre avis sur l'intervention..."
            maxLength={500}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            marginTop: '6px',
            textAlign: 'right'
          }}>
            {comment.length}/500 caractères
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
        }}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '10px',
              border: '2px solid rgba(255,255,255,0.5)',
              backgroundColor: 'transparent',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'all 0.3s'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: rating === 0 || isSubmitting ? 'rgba(255,255,255,0.3)' : 'white',
              color: rating === 0 || isSubmitting ? 'rgba(255,255,255,0.7)' : '#764ba2',
              fontSize: '16px',
              fontWeight: '700',
              cursor: rating === 0 || isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Envoi...
              </>
            ) : (
              <>✓ Soumettre l'évaluation</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
