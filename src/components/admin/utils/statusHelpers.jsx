/**
 * Retourne la classe CSS pour le badge de statut
 */
export function getStatusBadgeClass(status, styles) {
  const mapping = {
    pending: styles.statusPending,
    in_progress: styles.statusInProgress,
    termine_artisan: styles.statusCompleted,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
    externalized: styles.statusExternalized
  };
  return mapping[status] || styles.statusCompleted;
}

/**
 * Retourne le label lisible pour un statut
 */
export function getStatusLabel(status) {
  const labels = {
    pending: '⏳ Attente',
    in_progress: '⚙️ En cours',
    termine_artisan: '✅ Terminé',
    completed: '🏁 Clôturé',
    cancelled: '❌ Annulé',
    externalized: '🌐 Externalisé'
  };
  return labels[status] || status;
}

/**
 * Détermine si un ticket peut être assigné
 */
export function canAssignTicket(ticket) {
  return !['completed', 'cancelled', 'externalized'].includes(ticket.status) && !ticket.assignedToName;
}

/**
 * Détermine si un ticket peut être externalisé
 */
export function canExternalizeTicket(ticket) {
  return !['completed', 'cancelled'].includes(ticket.status) && !ticket.isExternalized;
}