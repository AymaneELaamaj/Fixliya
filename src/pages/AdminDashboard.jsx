import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../src/services/authService';

// Hooks
import { useAdminData } from '../hooks/admin/useAdminData';

// Components
import Sidebar from '../components/admin/layout/Sidebar';
import TicketsTab from '../components/admin/tabs/TicketsTab';
import ArtisansTab from '../components/admin/tabs/ArtisansTab';
import StudentsTab from '../components/admin/tabs/StudentsTab';
import StatisticsTab from '../components/admin/tabs/StatisticsTab';
import ExternalizeModal from '../components/admin/modals/ExternalizeModal';

// Styles
import styles from '../components/admin/styles/AdminDashboard.module.css';

// Constants
const TAB_TITLES = {
  tickets: '📋 Gestion des Tickets',
  artisans: '👨‍🔧 Gestion des Artisans',
  statistics: '📊 Statistiques & Rapports',
  students: '👨‍🎓 Gestion des Étudiants'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [externalizeModal, setExternalizeModal] = useState({
    isOpen: false,
    ticket: null
  });

  // Charger toutes les données avec le hook personnalisé
  const {
    tickets,
    artisans,
    externalProviders,
    statistics,
    students,
    loading,
    error,
    actions
  } = useAdminData();

  // Handlers
  const handleLogout = useCallback(async () => {
    await logoutUser();
    navigate('/login');
  }, [navigate]);

  const handleAssignTicket = useCallback(async (ticketId, artisanId) => {
    if (!artisanId) return;

    const selectedArtisan = artisans.find(a => a.id === artisanId);
    if (!selectedArtisan) return;

    if (window.confirm(`Assigner ce ticket à ${selectedArtisan.prenom} ?`)) {
      try {
        await actions.assignTicket(ticketId, artisanId);
        alert('Ticket assigné avec succès !');
      } catch (err) {
        alert(err.message);
      }
    }
  }, [artisans, actions]);

  const handleOpenExternalizeModal = useCallback((ticket) => {
    setExternalizeModal({ isOpen: true, ticket });
  }, []);

  const handleCloseExternalizeModal = useCallback(() => {
    setExternalizeModal({ isOpen: false, ticket: null });
  }, []);

  const handleExternalizeTicket = useCallback(async (providerId) => {
    if (!externalizeModal.ticket) return;

    try {
      const provider = await actions.externalizeTicket(externalizeModal.ticket.id, providerId);
      alert(`Ticket externalisé avec succès à ${provider.name} !`);
      handleCloseExternalizeModal();
    } catch (err) {
      alert('Erreur lors de l\'externalisation: ' + err.message);
    }
  }, [externalizeModal.ticket, actions, handleCloseExternalizeModal]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        Chargement du tableau de bord...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div>
          <p>❌ Erreur lors du chargement: {error}</p>
          <button onClick={() => window.location.reload()} className={`${styles.btn} ${styles.btnPrimary}`}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tickets':
        return (
          <TicketsTab
            tickets={tickets}
            artisans={artisans}
            onAssign={handleAssignTicket}
            onExternalize={handleOpenExternalizeModal}
          />
        );

      case 'artisans':
        return (
          <ArtisansTab
            artisans={artisans}
            onUpdate={actions.updateArtisan}
            onDelete={actions.deleteArtisan}
            onCreate={actions.createArtisan}
          />
        );

      case 'students':
        return (
          <StudentsTab
            students={students}
            onToggleStatus={actions.toggleStudentStatus}
          />
        );

      case 'statistics':
        return <StatisticsTab statistics={statistics} />;

      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{TAB_TITLES[activeTab]}</h1>
        </header>

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Externalize Modal */}
      {externalizeModal.isOpen && (
        <ExternalizeModal
          ticket={externalizeModal.ticket}
          providers={externalProviders}
          onExternalize={handleExternalizeTicket}
          onClose={handleCloseExternalizeModal}
        />
      )}
    </div>
  );
}