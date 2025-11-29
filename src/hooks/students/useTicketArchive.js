import { useState, useCallback } from 'react';
import { archiveTicket, unarchiveTicket } from '../../services/ticketService';

/**
 * Hook pour gérer l'archivage des tickets
 */
export const useTicketArchive = (studentId, onSuccess) => {
  const [isArchiving, setIsArchiving] = useState(false);

  /**
   * Archiver un ticket
   */
  const handleArchive = useCallback(async (ticketId) => {
    if (!ticketId || !studentId) return;

    setIsArchiving(true);
    try {
      await archiveTicket(ticketId, studentId);
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Erreur archivage:', error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [studentId, onSuccess]);

  /**
   * Désarchiver un ticket
   */
  const handleUnarchive = useCallback(async (ticketId) => {
    if (!ticketId) return;

    setIsArchiving(true);
    try {
      await unarchiveTicket(ticketId);
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Erreur désarchivage:', error);
      throw error;
    } finally {
      setIsArchiving(false);
    }
  }, [onSuccess]);

  /**
   * Vérifier si un ticket peut être archivé
   */
  const canArchive = useCallback((ticket) => {
    if (!ticket) return false;
    
    // Seuls les tickets terminés ou annulés peuvent être archivés
    const archivableStatuses = ['completed', 'cancelled'];
    return archivableStatuses.includes(ticket.status) && !ticket.archived;
  }, []);

  return {
    handleArchive,
    handleUnarchive,
    canArchive,
    isArchiving
  };
};
