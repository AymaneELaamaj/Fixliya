import React from 'react';
import { useTicketFilters } from '../../../hooks/admin/useTicketFilters';
import { getStatusBadgeClass, getStatusLabel } from '../utils/statusHelpers';
import styles from '../styles/AdminDashboard.module.css';

export default function TicketsTab({ tickets, artisans, onAssign, onExternalize }) {
  const {
    filters,
    filteredTickets,
    categories,
    updateFilter,
    ticketCount
  } = useTicketFilters(tickets);

  return (
    <div className={styles.section}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
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

      {/* Table */}
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