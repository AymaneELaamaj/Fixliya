/**
 * Styles pour les composants de l'espace étudiant
 */
export const studentStyles = {
  // Container principal
  container: {
    padding: '20px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    maxWidth: '700px',
    margin: '0 auto'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '15px'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  welcome: {
    fontSize: '22px',
    color: '#1f2937',
    margin: 0,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '5px 0 0 0'
  },
  logoutBtn: {
    border: 'none',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },

  // Zone d'action
  actionArea: {
    marginBottom: '25px'
  },
  createBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    backgroundColor: '#005596',
    color: 'white',
    textAlign: 'center',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '15px',
    boxShadow: '0 2px 8px rgba(0,85,150,0.2)'
  },

  // Liste des tickets
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#1f2937',
    margin: 0,
    fontWeight: 'bold'
  },
  ticketCount: {
    backgroundColor: '#005596',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },

  // Filtrage
  filterSection: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '6px'
  },
  filterSelect: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },

  // Carte de ticket
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    display: 'flex',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  urgentIndicator: {
    width: '4px',
    minHeight: '100%'
  },
  cardContent: {
    flex: 1,
    padding: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '10px'
  },
  headerLeft: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  categoryBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#005596',
    backgroundColor: '#dbeafe',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  urgentBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  description: {
    fontSize: '14px',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: '1.4',
    margin: '0 0 8px 0'
  },
  location: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '10px',
    margin: '0 0 10px 0'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
    gap: '8px',
    flexWrap: 'wrap'
  },
  date: {
    fontSize: '12px',
    color: '#9ca3af'
  },

  // Boutons et affichages
  validateBtn: {
    backgroundColor: '#7e22ce',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  ratingDisplay: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#d97706'
  },
  ticketCancelBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    marginLeft: '8px'
  },

  // États vides et chargement
  emptyState: {
    backgroundColor: 'white',
    padding: '40px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '15px'
  },

  // Modale
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 15px 0'
  },

  // Photos dans la modale
  photosSection: {
    marginBottom: '20px',
    backgroundColor: '#f9fafb',
    padding: '15px',
    borderRadius: '8px'
  },
  photosTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0 0 12px 0'
  },
  photosContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  photoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  photoLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b7280',
    margin: 0
  },
  photoImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },

  // Contenu de la modale
  validationText: {
    fontSize: '14px',
    color: '#1f2937',
    marginBottom: '15px',
    margin: '0 0 15px 0'
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '15px',
    color: '#1f2937'
  },
  starContainer: {
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    minHeight: '80px',
    marginBottom: '20px',
    fontFamily: 'inherit',
    fontSize: '13px',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#6b7280'
  },
  confirmBtn: {
    padding: '10px 20px',
    border: 'none',
    background: '#16a34a',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },

  // Compte désactivé
  disabledAccountContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#fee2e2',
    padding: '20px'
  },
  disabledIcon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  disabledTitle: {
    fontSize: '28px',
    color: '#dc2626',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textAlign: 'center'
  },
  disabledMessage: {
    fontSize: '16px',
    color: '#991b1b',
    fontWeight: '600',
    margin: '0 0 10px 0',
    textAlign: 'center',
    maxWidth: '400px'
  },
  disabledDescription: {
    fontSize: '14px',
    color: '#7f1d1d',
    margin: '0 0 30px 0',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.6'
  },
  logoutBtnDisabled: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};
