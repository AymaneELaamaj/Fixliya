/**
 * Styles pour les composants de l'espace artisan
 */
export const artisanStyles = {
  pageContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0 },

  // SIDEBAR
  sidebar: {
    width: '250px',
    backgroundColor: '#005596',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 0
  },
  sidebarHeader: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.2)' },
  sidebarTitle: { margin: 0, fontSize: '24px', fontWeight: 'bold' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', flex: 1 },
  navButton: {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all 0.3s'
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white'
  },
  logoutBtnSidebar: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 'auto',
    transition: 'all 0.3s'
  },

  // MAIN CONTENT
  mainContent: {
    flex: 1,
    marginLeft: '250px',
    padding: '30px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  header: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' },
  pageTitle: { fontSize: '32px', fontWeight: 'bold', color: '#005596', margin: '0 0 8px 0' },
  subtitle: { fontSize: '16px', color: '#6b7280', margin: 0 },

  section: { marginBottom: '30px' },

  // MISSION CARDS
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #e5e7eb',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderLeftWidth: '4px',
    borderLeftColor: '#005596'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  categoryTag: { backgroundColor: '#e0f2fe', color: '#005596', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' },
  urgentBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
  locationRow: { fontSize: '16px', fontWeight: '600', color: '#005596' },
  description: { color: '#4b5563', lineHeight: '1.5', margin: 0, fontSize: '14px' },
  studentInfo: { fontSize: '13px', color: '#6b7280', marginTop: 'auto' },

  // Groupe de boutons
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },
  btnStart: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(0, 85, 150, 0.2)'
  },
  btnFinish: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: 0,
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
  },

  // HISTORY CARDS
  historyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #e5e7eb',
    borderLeftWidth: '5px',
    borderLeftColor: '#16a34a',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'all 0.3s'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  },
  historyHeaderLeft: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  archivedBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  historyStatsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '2px solid #005596',
    boxShadow: '0 2px 6px rgba(0, 85, 150, 0.1)'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#005596'
  },
  statLabel: {
    fontSize: '12px',
    color: '#0369a1',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '120px'
  },
  statDivider: {
    color: '#005596',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  historyDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  detailRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '8px 0'
  },
  detailIcon: {
    fontSize: '16px',
    minWidth: '20px',
    color: '#005596'
  },
  detailText: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500'
  },
  descriptionBox: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '3px solid #005596'
  },
  descriptionText: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.4'
  },
  photoArchiveSection: {
    backgroundColor: '#f0f9ff',
    border: '2px solid #005596',
    borderRadius: '8px',
    padding: '12px'
  },
  photoArchiveTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#005596'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px'
  },
  photoCard: {
    position: 'relative',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '2px solid #bae6fd'
  },
  photoLabel: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    zIndex: 10
  },
  archivePhoto: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    display: 'block'
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fcd34d'
  },
  ratingLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#92400e'
  },
  ratingStars: {
    display: 'flex',
    gap: '4px',
    flex: 1
  },
  ratingValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#d97706',
    minWidth: '40px',
    textAlign: 'right'
  },
  commentBox: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '3px solid #d97706',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  commentLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b7280'
  },
  commentText: {
    margin: 0,
    fontSize: '13px',
    color: '#555',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  noComment: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: '13px',
    margin: 0
  },
  pendingValidationBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef3c7',
    border: '2px solid #fcd34d',
    borderRadius: '8px',
    padding: '12px',
    justifyContent: 'center'
  },
  pendingIcon: {
    fontSize: '18px'
  },
  pendingText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#92400e'
  },
  timestampBox: {
    backgroundColor: '#e0f2fe',
    border: '2px solid #005596',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center'
  },
  timestampText: {
    fontSize: '12px',
    color: '#005596',
    fontWeight: '600'
  },
  dateTag: {
    fontSize: '12px',
    color: '#005596',
    backgroundColor: '#e0f2fe',
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: '600',
    border: '1px solid #005596'
  },

  // EMPTY STATE
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '15px' },

  // MODAL
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
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '15px'
  },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#9ca3af',
    transition: 'all 0.3s'
  },

  // PROOF
  proofContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px'
  },
  phaseContainer: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  },
  phaseTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  phaseComplete: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  phaseIncomplete: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  proofSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  proofTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  startPhotoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
    padding: '30px 20px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '2px dashed #0284c7'
  },
  instructionText: {
    fontSize: '14px',
    color: '#0369a1',
    fontWeight: '600',
    textAlign: 'center'
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#000',
    borderRadius: '8px',
    padding: '12px',
    border: '2px solid #1f2937'
  },
  video: {
    width: '100%',
    height: '400px',
    backgroundColor: '#000',
    borderRadius: '6px',
    objectFit: 'cover',
    display: 'block'
  },
  cameraButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  captureBtn: {
    flex: 1,
    maxWidth: '300px',
    padding: '14px 20px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(0, 85, 150, 0.2)'
  },
  cancelPhotoBtn: {
    flex: 1,
    maxWidth: '300px',
    padding: '14px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)'
  },
  openCameraBtn: {
    padding: '14px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(0, 85, 150, 0.2)'
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#f0f9ff',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #005596'
  },
  previewText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#005596',
    textAlign: 'center'
  },
  previewActionButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  retakeBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fca5a5',
    color: '#991b1b',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
  },
  confirmBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#86efac',
    color: '#15803d',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
  },
  photoConfirmSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  photoActionButtons: {
    display: 'flex',
    gap: '10px'
  },
  retakePhotoBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fed7aa',
    color: '#b45309',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  confirmPhotoBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#d1d5db',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  photoPreview: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    border: '2px solid #e5e7eb'
  },
  proofImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  deletePhotoBtn: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    padding: '8px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },

  // MODAL FOOTER
  modalFooter: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: '2px solid #e5e7eb',
    paddingTop: '20px',
    marginTop: '20px'
  },
  footerHint: {
    margin: 0,
    flex: 1,
    fontSize: '14px',
    color: '#b45309',
    fontWeight: '600'
  },
  submitBtn: {
    padding: '12px 24px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
  },
  cancelBtn: {
    padding: '12px 24px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  planifierBadge: {
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #bae6fd'
  },
  planificationSection: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '10px 12px',
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  planificationItem: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0369a1'
  }
};
