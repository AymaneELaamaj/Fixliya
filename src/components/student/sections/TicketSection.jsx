import React from 'react';
import TicketCard from '../cards/TicketCard';

export default function TicketSection({ 
  title, 
  icon, 
  tickets, 
  onValidate,
  onCancel,
  onArchive,
  canArchive
}) {
  if (tickets.length === 0) {
    return null;
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <span style={styles.sectionTitle}>{title}</span>
        <span style={styles.sectionCount}>{tickets.length}</span>
      </div>
      
      <div style={styles.ticketsList}>
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onValidate={onValidate}
            onCancel={onCancel}
            onArchive={onArchive}
            canArchive={canArchive}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: '30px'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb'
  },

  sectionIcon: {
    fontSize: '24px'
  },

  sectionTitle: {
    flex: 1,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937'
  },

  sectionCount: {
    backgroundColor: '#005596',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '4px 12px',
    borderRadius: '12px',
    minWidth: '28px',
    textAlign: 'center'
  },

  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  }
};
