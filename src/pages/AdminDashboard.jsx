import React, { useState, useCallback, useMemo } from 'react';
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
import LocalsTab from '../components/admin/tabs/LocalsTab';
import ExternalizeModal from '../components/admin/modals/ExternalizeModal';
import BuildingView from '../components/admin/BuildingView'; // Votre composant 2D

// Styles
import styles from '../components/admin/styles/AdminDashboard.module.css';

const TAB_TITLES = {
  tickets: '📋 Gestion des Tickets',
  artisans: '👨‍🔧 Gestion des Artisans',
  statistics: '📊 Statistiques & Rapports',
  students: '👨‍🎓 Gestion des Étudiants',
  locals: '🏢 Gestion des Locaux'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  
  // --- NOUVEAUX ÉTATS POUR LA VUE 2D ---
  const [viewMode, setViewMode] = useState('2d'); // '2d' ou 'list'
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // --- ÉTAT POUR LE MENU MOBILE ---
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [externalizeModal, setExternalizeModal] = useState({
    isOpen: false,
    ticket: null
  });

  // 1. CHARGEMENT DES VRAIES DONNÉES
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

  // --- 2. INTELLIGENCE : Calculer les bâtiments depuis les tickets ---
  // On utilise useMemo pour ne pas recalculer à chaque clic
  const buildingsFromData = useMemo(() => {
    if (!tickets) return [];

    const buildingMap = {};

    tickets.forEach(ticket => {
      // Extraction intelligente du nom du bâtiment depuis le lieu
      // Ex: "Bâtiment A - Chambre 1" -> "Bâtiment A"
      // Si pas de tiret, on prend tout le lieu
      const buildingName = ticket.location ? ticket.location.split(' - ')[0].trim() : "Autre";

      if (!buildingMap[buildingName]) {
        buildingMap[buildingName] = { 
          id: buildingName, 
          name: buildingName, 
          incidents: 0, 
          status: 'safe' 
        };
      }

      // Si le ticket n'est pas terminé, c'est un incident actif
      if (ticket.statut !== 'Terminé' && ticket.statut !== 'Clôturé') {
        buildingMap[buildingName].incidents += 1;
        buildingMap[buildingName].status = 'alert'; // Devient ROUGE
      }
    });

    return Object.values(buildingMap);
  }, [tickets]);

  // --- 3. FILTRAGE DYNAMIQUE ---
  const filteredTickets = useMemo(() => {
    if (!selectedBuilding) return tickets;
    return tickets.filter(t => t.location && t.location.includes(selectedBuilding));
  }, [tickets, selectedBuilding]);


  // HANDLERS
  const handleLogout = useCallback(async () => {
    await logoutUser();
    navigate('/login');
  }, [navigate]);

  const handleBuildingClick = (buildingName) => {
    setSelectedBuilding(buildingName);
    setViewMode('list');
  };

  // ... (Vos anciens handlers : Assign, Externalize...)
  const handleAssignTicket = useCallback(async (ticketId, artisanId) => {
    if (!artisanId) return;
    const selectedArtisan = artisans.find(a => a.id === artisanId);
    if (!selectedArtisan) return;
    try {
      await actions.assignTicket(ticketId, artisanId);
    } catch (err) {
      console.error('Erreur assignation:', err);
      // Afficher un message visuel pour l'utilisateur
      const errorMsg = err.message?.includes('réseau') || err.message?.includes('offline') 
        ? '❌ Erreur réseau - Vérifiez votre connexion'
        : '❌ Erreur lors de l\'assignation';
      // Créer une notification visuelle temporaire
      const notification = document.createElement('div');
      notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:15px 20px;border-radius:8px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
      notification.textContent = errorMsg;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    }
  }, [artisans, actions]);

  const handleOpenExternalizeModal = useCallback((ticket) => { setExternalizeModal({ isOpen: true, ticket }); }, []);
  const handleCloseExternalizeModal = useCallback(() => { setExternalizeModal({ isOpen: false, ticket: null }); }, []);
  const handleExternalizeTicket = useCallback(async (providerId) => {
    if (!externalizeModal.ticket) return;
    try {
      await actions.externalizeTicket(externalizeModal.ticket.id, providerId);
      handleCloseExternalizeModal();
    } catch (err) {
      console.error('Erreur externalisation:', err);
    }
  }, [externalizeModal.ticket, actions, handleCloseExternalizeModal]);


  // Rendu Loading / Error
  if (loading) return <div className={styles.loadingContainer}>Chargement...</div>;
  if (error) return <div className={styles.loadingContainer}>Erreur: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      {/* Burger Menu Button (Mobile Only) */}
      <button 
        className={styles.burgerButton}
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Menu"
      >
        ☰
      </button>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main className={styles.mainContent}>
        
        {/* HEADER DYNAMIQUE */}
        <header className={styles.header}>
          <div style={{display:'flex', flexDirection:'column'}}>
             <h1 className={styles.pageTitle}>{TAB_TITLES[activeTab]}</h1>
             {/* Fil d'ariane si filtré */}
             {selectedBuilding && activeTab === 'tickets' && (
               <span style={{fontSize:'12px', color:'#ef4444', fontWeight:'bold'}}>
                 Filtre : {selectedBuilding} 
                 <button onClick={() => setSelectedBuilding(null)} style={{marginLeft:'10px', cursor:'pointer', border:'none', background:'none', textDecoration:'underline'}}>
                   (Effacer)
                 </button>
               </span>
             )}
          </div>

          {/* SWITCH VUE (Visible uniquement sur l'onglet Tickets) */}
          {activeTab === 'tickets' && (
            <div style={{ display:'flex', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <button 
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
                  background: viewMode === 'list' ? '#3b82f6' : 'transparent', color: viewMode === 'list' ? 'white' : '#6b7280'
                }}
              >
                Liste
              </button>
              <button 
                onClick={() => { setViewMode('2d'); setSelectedBuilding(null); }}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
                  background: viewMode === '2d' ? '#3b82f6' : 'transparent', color: viewMode === '2d' ? 'white' : '#6b7280'
                }}
              >
                Vue 2D
              </button>
            </div>
          )}
        </header>

        {/* CONTENU PRINCIPAL */}
        {activeTab === 'tickets' ? (
          viewMode === '2d' ? (
            // --- VUE 2D DYNAMIQUE ---
            <div className={styles.buildingsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', paddingBottom:'20px' }}>
              {buildingsFromData.length > 0 ? (
                buildingsFromData.map(b => (
                  <div key={b.id} onClick={() => handleBuildingClick(b.name)}>
                    <BuildingView name={b.name} incidents={b.incidents} />
                  </div>
                ))
              ) : (
                <div style={{gridColumn: '1/-1', textAlign:'center', padding:'40px', color:'#666'}}>
                  Aucun bâtiment détecté. Créez un ticket pour voir apparaître votre immeuble.
                </div>
              )}
            </div>
          ) : (
            // --- VUE LISTE (Vos composants existants avec données filtrées) ---
            <TicketsTab
              tickets={filteredTickets} // On passe la liste filtrée !
              artisans={artisans}
              onAssign={handleAssignTicket}
              onExternalize={handleOpenExternalizeModal}
            />
          )
        ) : activeTab === 'artisans' ? (
          <ArtisansTab artisans={artisans} onUpdate={actions.updateArtisan} onDelete={actions.deleteArtisan} onCreate={actions.createArtisan} />
        ) : activeTab === 'students' ? (
          <StudentsTab students={students} onToggleStatus={actions.toggleStudentStatus} />
        ) : activeTab === 'locals' ? (
          <LocalsTab />
        ) : (
          <StatisticsTab statistics={statistics} />
        )}

      </main>

      {/* Bottom Navigation (Mobile Only - Alternative) */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.bottomNavButton} ${activeTab === 'tickets' ? styles.active : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          📋
          <span>Tickets</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${activeTab === 'artisans' ? styles.active : ''}`}
          onClick={() => setActiveTab('artisans')}
        >
          👨‍🔧
          <span>Artisans</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${activeTab === 'locals' ? styles.active : ''}`}
          onClick={() => setActiveTab('locals')}
        >
          🏢
          <span>Locaux</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${activeTab === 'statistics' ? styles.active : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊
          <span>Stats</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${activeTab === 'students' ? styles.active : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👨‍🎓
          <span>Étudiants</span>
        </button>
      </nav>

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