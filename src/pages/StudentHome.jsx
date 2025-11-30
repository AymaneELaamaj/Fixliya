import React, { useState, useMemo, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chargement des données
  const { tickets, userName, userId, loading, isAccountDisabled, loadData } = useStudentData();

  // Système de notifications
  const {
    unreadCount,
    showToast,
    latestNotification,
    closeToast
  } = useNotifications(userId);

  // Système d'archivage
  const { handleArchive, handleUnarchive, canArchive } = useTicketArchive(userId, loadData);

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar avec navigation */}
      <StudentSidebar
        userName={userName}
        userEmail={userId}
        unreadNotifications={unreadCount}
        activeTickets={ticketSections.pending.length + ticketSections.inProgress.length}
        onLogout={handleLogout}
      />

      {/* Contenu principal */}
      <div className={`
        flex-1 transition-all duration-300
        ${isMobile ? 'ml-0 p-4 pt-[70px]' : 'ml-64 p-6'}
      `}>
        {/* En-tête avec bouton nouvelle réclamation */}
        <div className={`
          flex gap-4 mb-6
          ${isMobile ? 'flex-col items-stretch' : 'flex-row items-center justify-between'}
        `}>
          <div>
            <h1 className={`
              font-semibold text-gray-900 m-0
              ${isMobile ? 'text-2xl' : 'text-3xl'}
            `}>
              Mes Réclamations
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {ticketSections.pending.length + ticketSections.inProgress.length} réclamation(s) active(s)
            </p>
          </div>
          <button
            onClick={() => navigate('/app/student/create-ticket')}
            className={`
              px-6 py-3 bg-secondary text-white rounded-lg font-medium
              shadow-md hover:shadow-lg hover:bg-opacity-90
              transition-all duration-200
              ${isMobile ? 'w-full' : 'w-auto'}
            `}
          >
            ➕ Nouvelle Réclamation
          </button>
        </div>

        {/* Toggle afficher les archivées */}
        {ticketSections.archived.length > 0 && (
          <div className="mb-5 p-3 bg-white rounded-lg shadow-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-[18px] h-[18px] cursor-pointer accent-primary"
              />
              <span className="text-sm text-gray-700 font-medium">
                Afficher les réclamations archivées ({ticketSections.archived.length})
              </span>
            </label>
          </div>
        )}

        {/* Sections de tickets */}
        <div className="flex flex-col gap-6">
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
            <div className="text-center py-16 px-5 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucune réclamation
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Vous n'avez pas encore créé de réclamation.
              </p>
              <button
                onClick={() => navigate('/app/student/create-ticket')}
                className="px-6 py-3 bg-secondary text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-200"
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
