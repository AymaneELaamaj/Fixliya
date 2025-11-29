import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

// Hooks
import {
  useStudentData,
  useTicketFilters,
  useTicketValidation,
  useTicketActions
} from '../hooks/students';

// Components
import {
  StudentHeader,
  DisabledAccountScreen,
  CreateTicketButton,
  TicketFilters,
  TicketList,
  ValidationModal,
  studentStyles
} from '../components/student';

/**
 * Page d'accueil de l'espace étudiant
 */
export default function StudentDashboard() {
  const navigate = useNavigate();

  // Chargement des données
  const { tickets, userName, loading, isAccountDisabled, loadData } = useStudentData();

  // Filtrage et tri
  const {
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    categories,
    filteredAndSortedTickets
  } = useTicketFilters(tickets);

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
    <div style={studentStyles.container}>
      <StudentHeader
        userName={userName}
        onLogout={handleLogout}
        styles={studentStyles}
      />

      <CreateTicketButton styles={studentStyles} />

      <TicketFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        styles={studentStyles}
      />

      <TicketList
        tickets={filteredAndSortedTickets}
        onValidate={openValidation}
        onCancel={handleCancelTicket}
        styles={studentStyles}
      />

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
