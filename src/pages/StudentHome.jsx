import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

// Hooks
import {
  useStudentData,
  useTicketValidation,
  useTicketActions,
  useNotifications,
  useTicketArchive
} from '../hooks/students';

// Components
import {
  StudentSidebar,
  DisabledAccountScreen,
  ValidationModal,
  NotificationToast,
  studentStyles
} from '../components/student';
import TicketCard from '../components/student/cards/TicketCard';
import TicketSection from '../components/student/sections/TicketSection';

/**
 * Page d'accueil de l'espace étudiant avec sidebar et sections organisées
 */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);

  // Chargement des données
  const { tickets, userName, userId, loading, isAccountDisabled, loadData } = useStudentData();

  // Système de notifications
  const {
    notifications,
    unreadCount,
    showToast,
    latestNotification,
    closeToast,
    markAsRead
  } = useNotifications(userId);

  // Système d'archivage
  const { handleArchive, handleUnarchive, canArchive, isArchiving } = useTicketArchive(userId, loadData);

  // Validation et notation
  const {
    selectedTicket,
    rating,
    comment,
    setRating,
    setComment,
    openValidation,
    closeValidation,
    submitValidation
  } = useTicketValidation(loadData);

  // Actions sur les tickets
  const { handleCancelTicket } = useTicketActions(loadData);

  // Organisation des tickets par sections
  const ticketSections = useMemo(() => {
    const activeTickets = showArchived
      ? tickets
      : tickets.filter(t => !t.archived);

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return {
      pending: activeTickets.filter(t => !t.assignedToId && t.status === 'pending'),
      inProgress: activeTickets.filter(t => t.status === 'in_progress' || t.status === 'pending' && t.assignedToId),
      recentCompleted: activeTickets.filter(t =>
        (t.status === 'termine_artisan' || t.status === 'completed') &&
        new Date(t.updatedAt) > twoDaysAgo
      ),
      archived: tickets.filter(t => t.archived)
    };
  }, [tickets, showArchived]);

  // Déconnexion
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  // Redirection si besoin
  React.useEffect(() => {
    const checkAuth = async () => {
      const result = await loadData();
      if (result?.needsRedirect) {
        navigate('/login');
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // États de chargement
  if (loading) {
    return <div style={studentStyles.loading}>Chargement...</div>;
  }

  // Compte désactivé
  if (isAccountDisabled) {
    return (
      <DisabledAccountScreen
        onLogout={handleLogout}
        styles={studentStyles}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar avec navigation */}
      <StudentSidebar
        userName={userName}
        userEmail={userId}
        unreadNotifications={unreadCount}
        activeTickets={ticketSections.pending.length + ticketSections.inProgress.length}
        onLogout={handleLogout}
      />

      {/* Contenu principal */}
      <div style={styles.mainContent}>
        {/* En-tête avec bouton nouvelle réclamation */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Mes Réclamations</h1>
            <p style={styles.subtitle}>
              {ticketSections.pending.length + ticketSections.inProgress.length} réclamation(s) active(s)
            </p>
          </div>
          <button
            onClick={() => navigate('/app/student/create-ticket')}
            style={styles.createButton}
          >
            ➕ Nouvelle Réclamation
          </button>
        </div>

        {/* Toggle afficher les archivées */}
        {ticketSections.archived.length > 0 && (
          <div style={styles.archiveToggle}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.toggleText}>
                Afficher les réclamations archivées ({ticketSections.archived.length})
              </span>
            </label>
          </div>
        )}

        {/* Sections de tickets */}
        <div style={styles.sections}>
          {/* En attente d'assignation */}
          {ticketSections.pending.length > 0 && (
            <TicketSection
              title="⏳ En attente d'assignation"
              icon="⏳"
              tickets={ticketSections.pending}
              onValidate={openValidation}
              onCancel={handleCancelTicket}
              onArchive={handleArchive}
              canArchive={canArchive}
            />
          )}

          {/* En cours d'intervention */}
          {ticketSections.inProgress.length > 0 && (
            <TicketSection
              title="🔧 En cours d'intervention"
              icon="🔧"
              tickets={ticketSections.inProgress}
              onValidate={openValidation}
              onCancel={handleCancelTicket}
              onArchive={handleArchive}
              canArchive={canArchive}
            />
          )}

          {/* Terminées récemment */}
          {ticketSections.recentCompleted.length > 0 && (
            <TicketSection
              title="✅ Terminées récemment"
              icon="✅"
              tickets={ticketSections.recentCompleted}
              onValidate={openValidation}
              onCancel={handleCancelTicket}
              onArchive={handleArchive}
              canArchive={canArchive}
            />
          )}

          {/* Archivées (si toggle activé) */}
          {showArchived && ticketSections.archived.length > 0 && (
            <TicketSection
              title="📦 Réclamations archivées"
              icon="📦"
              tickets={ticketSections.archived}
              onValidate={openValidation}
              onCancel={handleCancelTicket}
              onArchive={handleUnarchive}
              canArchive={() => true}
            />
          )}

          {/* Message si aucun ticket */}
          {tickets.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>Aucune réclamation</h3>
              <p style={styles.emptyText}>
                Vous n'avez pas encore créé de réclamation.
              </p>
              <button
                onClick={() => navigate('/app/student/create-ticket')}
                style={styles.emptyButton}
              >
                Créer ma première réclamation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast de notification */}
      {showToast && latestNotification && (
        <NotificationToast
          notification={latestNotification}
          onClose={closeToast}
        />
      )}

      {/* Modal de validation */}
      <ValidationModal
        ticket={selectedTicket}
        rating={rating}
        comment={comment}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onConfirm={submitValidation}
        onCancel={closeValidation}
        styles={studentStyles}
      />
    </div>
  );
}

// Styles spécifiques pour le layout avec sidebar
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
    marginLeft: '260px', // Largeur du sidebar
    padding: '24px',
    transition: 'margin-left 0.3s ease',
    '@media (max-width: 768px)': {
      marginLeft: 0,
      padding: '16px',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0, 85, 150, 0.2)',
  },
  archiveToggle: {
    marginBottom: '20px',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  toggleText: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '12px 24px',
    backgroundColor: '#005596',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
