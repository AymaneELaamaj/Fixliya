import { cancelTicket } from '../../services/ticketService';

/**
 * Hook pour gérer les actions sur les tickets (annulation, etc.)
 */
export const useTicketActions = (onActionSuccess) => {
  // Annuler un ticket
  const handleCancelTicket = async (ticket) => {
    const reason = prompt("Raison de l'annulation (optionnelle):", "");
    if (reason === null) return; // Utilisateur a cliqué Annuler

    if (window.confirm("Êtes-vous sûr de vouloir annuler ce ticket ?")) {
      try {
        await cancelTicket(ticket.id, reason);

        if (onActionSuccess) {
          await onActionSuccess();
        }
      } catch (error) {
        console.error('Erreur annulation:', error);
      }
    }
  };

  return {
    handleCancelTicket
  };
};
