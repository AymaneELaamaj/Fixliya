import React from 'react';
import { TicketCard } from './TicketCard';

/**
 * Liste des tickets de l'étudiant
 */
export const TicketList = ({
  tickets,
  onValidate,
  onCancel,
  styles
}) => {
  return (
    <div style={styles.ticketList}>
      <div style={styles.listHeader}>
        <h2 style={styles.sectionTitle}>Mes Tickets</h2>
        <span style={styles.ticketCount}>{tickets.length}</span>
      </div>

      {tickets.length === 0 ? (
        <div style={styles.emptyState}>Aucun ticket trouvé</div>
      ) : (
        tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onValidate={onValidate}
            onCancel={onCancel}
            styles={styles}
          />
        ))
      )}
    </div>
  );
};
