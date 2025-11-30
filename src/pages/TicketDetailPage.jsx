import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StudentSidebar } from '../components/student';
import RatingModal from '../components/student/modals/RatingModal';
import { validateTicket } from '../services/ticketService';

/**
 * Page de détail d'un ticket pour le résident
 */
export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        navigate('/login');
        return;
      }

      const ticketRef = doc(db, 'tickets', ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        alert('Ticket introuvable');
        navigate('/app/student');
        return;
      }

      const ticketData = { id: ticketSnap.id, ...ticketSnap.data() };

      // Vérifier que le ticket appartient bien à l'utilisateur
      if (ticketData.studentId !== userId) {
        alert('Accès non autorisé');
        navigate('/app/student');
        return;
      }

      setTicket(ticketData);
    } catch (error) {
      console.error('Erreur chargement ticket:', error);
      alert('Erreur lors du chargement du ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async ({ rating, comment }) => {
    try {
      setIsSubmittingRating(true);
      await validateTicket(ticketId, rating, comment);
      
      // Recharger le ticket
      await loadTicket();
      setShowRatingModal(false);
      
      alert('✅ Merci pour votre évaluation !');
    } catch (error) {
      console.error('Erreur soumission évaluation:', error);
      alert('Erreur lors de la soumission de l\'évaluation');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { text: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
      'in_progress': { text: 'En cours', color: '#3b82f6', bg: '#dbeafe' },
      'termine_artisan': { text: 'Terminé (artisan)', color: '#10b981', bg: '#d1fae5' },
      'completed': { text: 'Clôturé', color: '#6366f1', bg: '#e0e7ff' },
      'cancelled': { text: 'Annulé', color: '#ef4444', bg: '#fee2e2' }
    };
    
    const badge = badges[status] || badges['pending'];
    
    return (
      <span style={{
        backgroundColor: badge.bg,
        color: badge.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const canRate = ticket?.status === 'termine_artisan' && !ticket?.rating;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <StudentSidebar userName={auth.currentUser?.displayName || 'Résident'} />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px',
        padding: isMobile ? '16px' : '24px',
        paddingTop: isMobile ? '70px' : '24px',
        paddingBottom: isMobile ? '80px' : '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => navigate('/app/student')}
            style={{
              background: '#e5e7eb',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: isMobile ? '20px' : '28px',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0
          }}>
            Détail du Ticket
          </h1>
        </div>

        {/* Ticket Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '20px' : '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          {/* Status & Category */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {getStatusBadge(ticket.status)}
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {ticket.category}
            </span>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📍 Lieu</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>{ticket.location}</div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>📝 Description</div>
            <div style={{ fontSize: '15px', lineHeight: '1.6' }}>{ticket.description}</div>
          </div>

          {/* Photos du résident */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
                📷 Photos du problème ({ticket.imageUrls.length})
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: '10px'
              }}>
                {ticket.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 1}`}
                    onClick={() => window.open(url, '_blank')}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Audio du résident */}
          {ticket.audioUrl && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
                🎙️ Message vocal
              </div>
              <audio controls style={{ width: '100%', borderRadius: '8px' }}>
                <source src={ticket.audioUrl} type="audio/mp3" />
              </audio>
            </div>
          )}

          {/* Preuves artisan */}
          {(ticket.beforePhotoUrl || ticket.afterPhotoUrl) && (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '2px solid #86efac'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#059669',
                marginBottom: '12px',
                fontWeight: '700'
              }}>
                🛠️ Preuves d'intervention de l'artisan
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: ticket.beforePhotoUrl && ticket.afterPhotoUrl ? '1fr 1fr' : '1fr',
                gap: '15px'
              }}>
                {ticket.beforePhotoUrl && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                      📷 AVANT
                    </p>
                    <img
                      src={ticket.beforePhotoUrl}
                      alt="Photo avant"
                      onClick={() => window.open(ticket.beforePhotoUrl, '_blank')}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '3px solid #10b981'
                      }}
                    />
                  </div>
                )}
                {ticket.afterPhotoUrl && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6', marginBottom: '8px' }}>
                      📷 APRÈS
                    </p>
                    <img
                      src={ticket.afterPhotoUrl}
                      alt="Photo après"
                      onClick={() => window.open(ticket.afterPhotoUrl, '_blank')}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '3px solid #3b82f6'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artisan assigné */}
          {ticket.assignedToName && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>👨‍🔧 Artisan</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#059669' }}>
                {ticket.assignedToName}
              </div>
            </div>
          )}

          {/* Évaluation existante */}
          {ticket.rating && (
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #fbbf24'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '10px'
              }}>
                ⭐ Votre évaluation
              </div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                {'⭐'.repeat(ticket.rating)} ({ticket.rating}/5)
              </div>
              {ticket.comment && (
                <div style={{
                  fontSize: '14px',
                  color: '#475569',
                  fontStyle: 'italic',
                  lineHeight: '1.5'
                }}>
                  "{ticket.comment}"
                </div>
              )}
            </div>
          )}

          {/* Bouton d'évaluation */}
          {canRate && (
            <button
              onClick={() => setShowRatingModal(true)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#fbbf24',
                color: '#92400e',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ⭐ Évaluer l'intervention
            </button>
          )}

          {/* ID */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            ID: {ticket.id}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        show={showRatingModal}
        ticket={ticket}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        isSubmitting={isSubmittingRating}
      />
    </div>
  );
}
