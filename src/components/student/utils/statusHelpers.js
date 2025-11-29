/**
 * Obtenir les informations de style pour chaque statut de ticket
 */
export const getStatusInfo = (status) => {
  switch (status) {
    case 'pending':
      return { label: 'En attente', color: '#d97706', bg: '#fef3c7' };
    case 'in_progress':
      return { label: 'En cours', color: '#2563eb', bg: '#dbeafe' };
    case 'termine_artisan':
      return { label: 'À Valider', color: '#7e22ce', bg: '#f3e8ff' };
    case 'completed':
      return { label: 'Terminé', color: '#16a34a', bg: '#dcfce7' };
    default:
      return { label: status, color: '#374151', bg: '#f3f4f6' };
  }
};
