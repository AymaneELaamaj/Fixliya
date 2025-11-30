import React, { useState, useEffect, useMemo } from 'react';
import { useTicketFilters } from '../../../hooks/admin/useTicketFilters';
import { getStatusBadgeClass, getStatusLabel } from '../utils/statusHelpers';
import styles from '../styles/AdminDashboard.module.css';

export default function TicketsTab({ tickets, artisans, onAssign, onExternalize }) {
  const [locals, setLocals] = useState([]);
  const [selectedLocalFilter, setSelectedLocalFilter] = useState('all');
  
  const {
    filters,
    filteredTickets: baseFilteredTickets,
    categories,
    updateFilter,
    ticketCount
  } = useTicketFilters(tickets);

  // Charger les locaux pour le filtre
  useEffect(() => {
    const fetchLocals = async () => {
      try {
        const { getAllLocals } = await import('../../../services/localService');
        const allLocals = await getAllLocals();
        setLocals(allLocals.filter(local => local.isActive));
      } catch (error) {
        console.error("Erreur chargement locaux:", error);
      }
    };
    fetchLocals();
  }, []);

  // Filtrage supplémentaire par local
  const filteredTickets = useMemo(() => {
    if (selectedLocalFilter === 'all') {
      return baseFilteredTickets;
    }
    
    // Filtrer par localId si le ticket a cette propriété
    return baseFilteredTickets.filter(ticket => {
      if (ticket.localId) {
        return ticket.localId === selectedLocalFilter;
      }
      // Sinon, filtrer par nom de local dans la location
      const selectedLocal = locals.find(l => l.id === selectedLocalFilter);
      if (selectedLocal && ticket.location) {
        return ticket.location.includes(selectedLocal.name);
      }
      return false;
    });
  }, [baseFilteredTickets, selectedLocalFilter, locals]);

  return (
    <div className={styles.section}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {/* Filtre par Local */}
        <select
          value={selectedLocalFilter}
          onChange={(e) => setSelectedLocalFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">🏢 Tous les locaux</option>
          <optgroup label="Bâtiments">
            {locals.filter(l => l.type === 'building').map(local => (
              <option key={local.id} value={local.id}>
                {local.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Espaces Communs">
            {locals.filter(l => l.type === 'common_area').map(local => (
              <option key={local.id} value={local.id}>
                {local.name}
              </option>
            ))}
          </optgroup>
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="termine_artisan">Terminé (artisan)</option>
          <option value="completed">Clôturé</option>
          <option value="cancelled">Annulé</option>
          <option value="externalized">Externalisé</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.urgent}
          onChange={(e) => updateFilter('urgent', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tous les tickets</option>
          <option value="urgent">Urgent uniquement</option>
          <option value="normal">Normal uniquement</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="recent">Plus récents</option>
          <option value="urgent">Urgent d'abord</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thRow}>
              <th className={styles.thCell}>Catégorie</th>
              <th className={styles.thCell}>Lieu</th>
              <th className={styles.thCell}>Description</th>
              <th className={styles.thCell}>Photos Résident</th>
              <th className={styles.thCell}>Audio Résident</th>
              <th className={styles.thCell}>Preuves Artisan</th>
              <th className={styles.thCell}>Planification</th>
              <th className={styles.thCell}>Statut</th>
              <th className={styles.thCell}>Assigné à</th>
              <th className={styles.thCell}>ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                artisans={artisans}
                onAssign={onAssign}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className={styles.mobileTicketsList}>
        {filteredTickets.map(ticket => (
          <MobileTicketCard
            key={ticket.id}
            ticket={ticket}
            artisans={artisans}
            onAssign={onAssign}
            onExternalize={onExternalize}
          />
        ))}
      </div>

      <div className={styles.ticketCount}>
        📊 Total: <strong>{ticketCount}</strong> ticket(s)
      </div>
    </div>
  );
}

function TicketRow({ ticket, artisans, onAssign }) {
  const handleAssign = (e) => {
    const artisanId = e.target.value;
    if (artisanId) {
      onAssign(ticket.id, artisanId);
    }
  };

  return (
    <tr className={styles.tr}>
      {/* Catégorie */}
      <td className={styles.tdCell}>
        <span className={`${styles.badge} ${styles.badgeCategory}`}>
          {ticket.isUrgent && '🔴 '}{ticket.category}
        </span>
      </td>

      {/* Lieu */}
      <td className={styles.tdCell}>{ticket.location || 'N/A'}</td>

      {/* Description */}
      <td className={`${styles.tdCell} ${styles.descriptionCell}`}>
        {ticket.description}
      </td>

      {/* Photos Résident */}
      <td className={styles.tdCell}>
        <MediaPhotosCell imageUrls={ticket.imageUrls} />
      </td>

      {/* Audio Résident */}
      <td className={styles.tdCell}>
        <MediaAudioCell audioUrl={ticket.audioUrl} />
      </td>

      {/* Preuves Artisan */}
      <td className={styles.tdCell}>
        <ArtisanProofCell 
          beforePhotoUrl={ticket.beforePhotoUrl}
          afterPhotoUrl={ticket.afterPhotoUrl}
        />
      </td>

      {/* Planification */}
      <td className={styles.tdCell}>
        <PlanificationCell ticket={ticket} />
      </td>

      {/* Statut */}
      <td className={styles.tdCell}>
        <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status, styles)}`}>
          {getStatusLabel(ticket.status)}
        </span>
      </td>

      {/* Assigné à */}
      <td className={styles.tdCell}>
        <AssignmentCell
          ticket={ticket}
          artisans={artisans}
          onAssign={handleAssign}
        />
      </td>

      {/* ID */}
      <td className={styles.tdCell}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
          {ticket.id.substring(0, 8)}
        </span>
      </td>
    </tr>
  );
}

function PlanificationCell({ ticket }) {
  if (ticket.ticketType === 'planifier' && ticket.scheduledDate) {
    return (
      <div className={styles.planificationInfo}>
        <div>📅 {ticket.scheduledDate}</div>
        {ticket.scheduledTime && <div>⏰ {ticket.scheduledTime}</div>}
      </div>
    );
  }

  if (ticket.isUrgent) {
    return <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🚨 Urgent</span>;
  }

  return <span style={{ color: '#94a3b8' }}>—</span>;
}

function AssignmentCell({ ticket, artisans, onAssign }) {
  if (ticket.status === 'completed') {
    return <span style={{ color: '#6b7280', fontSize: '12px' }}>Clôturé</span>;
  }

  if (ticket.status === 'cancelled') {
    return <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>Annulé</span>;
  }

  if (ticket.status === 'externalized') {
    return (
      <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 'bold' }}>
        🌐 {ticket.externalizedToName}
      </span>
    );
  }

  // Permettre la réassignation même si déjà assigné
  return (
    <select 
      onChange={onAssign} 
      className={styles.selectSmall} 
      value={ticket.assignedToId || ""}
      style={ticket.assignedToName ? { color: '#059669', fontWeight: 'bold' } : {}}
    >
      <option value="" disabled>
        {ticket.assignedToName ? `✓ ${ticket.assignedToName}` : 'Assigner...'}
      </option>
      {artisans.map(artisan => (
        <option key={artisan.id} value={artisan.id}>
          {artisan.prenom} ({artisan.specialite})
        </option>
      ))}
    </select>
  );
}

// Composants pour afficher les médias
function MediaPhotosCell({ imageUrls }) {
  const [showModal, setShowModal] = React.useState(false);

  if (!imageUrls || imageUrls.length === 0) {
    return <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        📷 {imageUrls.length} photo{imageUrls.length > 1 ? 's' : ''}
      </button>

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📷 Photos du Résident</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Photo ${index + 1}`}
                  onClick={() => window.open(url, '_blank')}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid #e5e7eb'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MediaAudioCell({ audioUrl }) {
  const [showModal, setShowModal] = React.useState(false);

  if (!audioUrl) {
    return <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: '#f59e0b',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        🎙️ Audio
      </button>

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>🎙️ Message Vocal du Résident</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            <audio 
              controls 
              autoPlay
              style={{
                width: '100%',
                borderRadius: '8px'
              }}
            >
              <source src={audioUrl} type="audio/mp3" />
            </audio>
          </div>
        </div>
      )}
    </>
  );
}

function ArtisanProofCell({ beforePhotoUrl, afterPhotoUrl }) {
  const [showModal, setShowModal] = React.useState(false);

  const hasProof = beforePhotoUrl || afterPhotoUrl;

  if (!hasProof) {
    return <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>;
  }

  const proofCount = (beforePhotoUrl ? 1 : 0) + (afterPhotoUrl ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        🛠️ {proofCount} preuve{proofCount > 1 ? 's' : ''}
      </button>

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>🛠️ Preuves d'Intervention de l'Artisan</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: beforePhotoUrl && afterPhotoUrl ? '1fr 1fr' : '1fr', gap: '15px' }}>
              {beforePhotoUrl && (
                <div>
                  <p style={{ fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>📷 AVANT l'intervention</p>
                  <img
                    src={beforePhotoUrl}
                    alt="Photo avant"
                    onClick={() => window.open(beforePhotoUrl, '_blank')}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '3px solid #10b981'
                    }}
                  />
                </div>
              )}
              {afterPhotoUrl && (
                <div>
                  <p style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>📷 APRÈS l'intervention</p>
                  <img
                    src={afterPhotoUrl}
                    alt="Photo après"
                    onClick={() => window.open(afterPhotoUrl, '_blank')}
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
        </div>
      )}
    </>
  );
}

// Mobile Ticket Card Component
function MobileTicketCard({ ticket, artisans, onAssign, onExternalize }) {
  const handleAssign = (e) => {
    const artisanId = e.target.value;
    if (artisanId) {
      onAssign(ticket.id, artisanId);
    }
  };

  const isCompleted = ticket.status === 'completed' || ticket.status === 'cancelled';
  const isExternalized = ticket.status === 'externalized';

  return (
    <div className={`${styles.mobileTicketCard} ${ticket.isUrgent ? styles.urgent : ''}`}>
      {/* Header: Urgence + Statut */}
      <div className={styles.mobileCardHeader}>
        <span className={`${styles.badge} ${ticket.isUrgent ? styles.badgeUrgent : styles.badgeNormal}`}>
          {ticket.isUrgent ? '🔴 URGENT' : '⚪ Normal'}
        </span>
        <span className={`${styles.badge} ${getStatusBadgeClass(ticket.status, styles)}`}>
          {getStatusLabel(ticket.status)}
        </span>
      </div>

      {/* Titre */}
      <div className={styles.mobileCardTitle}>
        {ticket.category} - {ticket.location || 'N/A'}
      </div>

      {/* Description tronquée */}
      <div className={styles.mobileCardDescription}>
        {ticket.description}
      </div>

      {/* Infos */}
      <div className={styles.mobileCardInfo}>
        <div className={styles.mobileCardInfoItem}>
          <span className={styles.mobileCardInfoLabel}>📍 Lieu:</span>
          <span>{ticket.location || 'N/A'}</span>
        </div>
        
        {ticket.ticketType === 'planifier' && ticket.scheduledDate && (
          <>
            <div className={styles.mobileCardInfoItem}>
              <span className={styles.mobileCardInfoLabel}>📅 Date:</span>
              <span>{ticket.scheduledDate}</span>
            </div>
            {ticket.scheduledTime && (
              <div className={styles.mobileCardInfoItem}>
                <span className={styles.mobileCardInfoLabel}>⏰ Heure:</span>
                <span>{ticket.scheduledTime}</span>
              </div>
            )}
          </>
        )}

        <div className={styles.mobileCardInfoItem}>
          <span className={styles.mobileCardInfoLabel}>👤 Assigné à:</span>
          <span>
            {isExternalized ? (
              <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>
                🌐 {ticket.externalizedToName}
              </span>
            ) : ticket.assignedToName ? (
              <span style={{ color: '#059669', fontWeight: 'bold' }}>
                ✓ {ticket.assignedToName}
              </span>
            ) : (
              <span style={{ color: '#94a3b8' }}>Non assigné</span>
            )}
          </span>
        </div>

        <div className={styles.mobileCardInfoItem}>
          <span className={styles.mobileCardInfoLabel}>🔖 ID:</span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
            {ticket.id.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className={styles.mobileCardActions}>
          {!isExternalized && (
            <select 
              onChange={handleAssign} 
              value={ticket.assignedToId || ""}
              style={{
                backgroundColor: ticket.assignedToName ? '#059669' : '#005596',
                color: 'white',
                fontWeight: '600'
              }}
            >
              <option value="" disabled>
                {ticket.assignedToName ? `✓ ${ticket.assignedToName}` : '👨‍🔧 Assigner à un artisan...'}
              </option>
              {artisans.map(artisan => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.prenom} ({artisan.specialite})
                </option>
              ))}
            </select>
          )}

          {!isExternalized && (
            <button
              onClick={() => onExternalize(ticket)}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                fontWeight: '600'
              }}
            >
              🌐 Externaliser ce ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}