import { useState } from 'react';
import { validateTicket } from '../../services/ticketService';

/**
 * Hook pour gérer la validation et notation des tickets
 */
export const useTicketValidation = (onValidationSuccess) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Ouvrir la popup de notation
  const openValidation = (ticket) => {
    setSelectedTicket(ticket);
    setRating(5);
    setComment("");
  };

  // Fermer la popup
  const closeValidation = () => {
    setSelectedTicket(null);
    setRating(5);
    setComment("");
  };

  // Envoyer la validation
  const submitValidation = async () => {
    if (!selectedTicket) return;

    try {
      await validateTicket(selectedTicket.id, rating, comment);
      alert("Merci pour votre retour ! Ticket clôturé.");
      closeValidation();

      if (onValidationSuccess) {
        await onValidationSuccess();
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la validation.");
    }
  };

  return {
    selectedTicket,
    rating,
    comment,
    setRating,
    setComment,
    openValidation,
    closeValidation,
    submitValidation
  };
};
