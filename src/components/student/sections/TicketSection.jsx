import React from 'react';
import TicketCard from '../cards/TicketCard';

/**
 * Section de tickets avec en-tête et liste
 * Tailwind CSS migration
 */
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
    <div className="mb-8">
      {/* En-tête de section */}
      <div className="flex items-center gap-3 pb-3 mb-4 border-b-2 border-gray-200">
        <span className="text-2xl">{icon}</span>
        <span className="flex-1 text-lg font-bold text-gray-800">
          {title}
        </span>
        <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full min-w-[28px] text-center">
          {tickets.length}
        </span>
      </div>
      
      {/* Liste des tickets */}
      <div className="flex flex-col gap-4">
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
