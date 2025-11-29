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
              <th className={styles.thCell}>Urgence</th>
              <th className={styles.thCell}>Catégorie</th>
              <th className={styles.thCell}>Lieu</th>
              <th className={styles.thCell}>Description</th>
              <th className={styles.thCell}>Planification</th>
              <th className={styles.thCell}>Statut</th>
              <th className={styles.thCell}>Assigné à</th>
              <th className={styles.thCell}>Actions</th>
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
                onExternalize={onExternalize}
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

function TicketRow({ ticket, artisans, onAssign, onExternalize }) {
  const handleAssign = (e) => {
    const artisanId = e.target.value;
    if (artisanId) {
      onAssign(ticket.id, artisanId);
    }
  };

  return (
    <tr className={styles.tr}>
      {/* Urgence */}
      <td className={styles.tdCell}>
        <span className={`${styles.badge} ${ticket.isUrgent ? styles.badgeUrgent : styles.badgeNormal}`}>
          {ticket.isUrgent ? '🔴 URGENT' : '⚪ Normal'}
        </span>
      </td>

      {/* Catégorie */}
      <td className={styles.tdCell}>
        <span className={`${styles.badge} ${styles.badgeCategory}`}>{ticket.category}</span>
      </td>

      {/* Lieu */}
      <td className={styles.tdCell}>{ticket.location || 'N/A'}</td>

      {/* Description */}
      <td className={`${styles.tdCell} ${styles.descriptionCell}`}>{ticket.description}</td>

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

      {/* Actions */}
      <td className={styles.tdCell}>
        <ActionsCell ticket={ticket} onExternalize={onExternalize} />
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

  if (ticket.assignedToName) {
    return <strong style={{ color: '#059669' }}>✓ {ticket.assignedToName}</strong>;
  }

  return (
    <select onChange={onAssign} className={styles.selectSmall} defaultValue="">
      <option value="" disabled>Assigner...</option>
      {artisans.map(artisan => (
        <option key={artisan.id} value={artisan.id}>
          {artisan.prenom} ({artisan.specialite})
        </option>
      ))}
    </select>
  );
}

function ActionsCell({ ticket, onExternalize }) {
  if (ticket.status === 'completed' || ticket.status === 'cancelled') {
    return <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>;
  }

  if (ticket.isExternalized) {
    return (
      <span className={styles.badgeExternalized}>
        🌐 {ticket.externalizedToName}
      </span>
    );
  }

  return (
    <button
      onClick={() => onExternalize(ticket)}
      className={`${styles.btn} ${styles.btnExternalize}`}
      title="Externaliser vers prestataire agréé"
    >
      🌐 Externaliser
    </button>
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
          {!isExternalized && !ticket.assignedToName && (
            <select 
              onChange={handleAssign} 
              defaultValue=""
              style={{
                backgroundColor: '#005596',
                color: 'white',
                fontWeight: '600'
              }}
            >
              <option value="" disabled>👨‍🔧 Assigner à un artisan...</option>
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