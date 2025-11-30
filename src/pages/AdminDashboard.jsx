import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

// --- IMPORTS POUR LES NOTIFICATIONS (NOUVEAU) ---
import { requestForToken, onMessageListener, db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 

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
import BuildingView from '../components/admin/BuildingView'; 

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
  
  // Pour récupérer l'utilisateur connecté (Admin)
  const { currentUser } = useAuth(); 

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

  // --- LOGIQUE NOTIFICATIONS (NOUVEAU) ---
  
  // Écouter les messages quand l'app est ouverte (Premier plan)
  useEffect(() => {
    onMessageListener().then(payload => {
      // Vous pouvez remplacer ceci par un joli Toast si vous préférez
      alert(`🔔 Nouveau message : ${payload.notification.title}`);
      // Optionnel : Recharger les données pour voir le nouveau ticket
      if (actions.refetch) actions.refetch(); 
    }).catch(err => console.log('Erreur listener:', err));
  }, [actions]);

  // Fonction pour activer les notifications sur cet appareil
  const enableNotifications = async () => {
    const token = await requestForToken();
    
    if (token && currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        // On ajoute le token à la liste sans effacer les autres (arrayUnion)
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token)
        });
        alert("✅ Notifications activées pour cet appareil !");
      } catch (error) {
        console.error("Erreur sauvegarde token:", error);
        alert("Erreur lors de l'enregistrement du token.");
      }
    } else {
      alert("❌ Impossible d'activer les notifications. Vérifiez les permissions.");
    }
  };

  // --- 2. INTELLIGENCE : Calculer les bâtiments depuis les tickets ---
  const buildingsFromData = useMemo(() => {
    if (!tickets) return [];

    const buildingMap = {};

    tickets.forEach(ticket => {
      const buildingName = ticket.location ? ticket.location.split(' - ')[0].trim() : "Autre";

      if (!buildingMap[buildingName]) {
        buildingMap[buildingName] = { 
          id: buildingName, 
          name: buildingName, 
          incidents: 0, 
          status: 'safe' 
        };
      }

      if (ticket.statut !== 'Terminé' && ticket.statut !== 'Clôturé') {
        buildingMap[buildingName].incidents += 1;
        buildingMap[buildingName].status = 'alert';
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

  const handleAssignTicket = useCallback(async (ticketId, artisanId) => {
    if (!artisanId) return;
    const selectedArtisan = artisans.find(a => a.id === artisanId);
    if (!selectedArtisan) return;
    try {
      await actions.assignTicket(ticketId, artisanId);
    } catch (err) {
      console.error('Erreur assignation:', err);
      const errorMsg = err.message?.includes('réseau') || err.message?.includes('offline') 
        ? '❌ Erreur réseau - Vérifiez votre connexion'
        : '❌ Erreur lors de l\'assignation';
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
          <div style={{display:'flex', flexDirection:'column', gap: '5px'}}>
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

          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            
            {/* BOUTON NOTIFICATIONS (NOUVEAU) */}
            <button 
              onClick={enableNotifications} 
              style={{
                padding: '8px 12px', 
                background: '#e11d48', // Rouge vif pour être visible
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 5px rgba(225, 29, 72, 0.3)'
              }}
              title="Recevoir les alertes sur cet appareil"
            >
              🔔 Activer Notifs
            </button>

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
          </div>
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
            // --- VUE LISTE ---
            <TicketsTab
              tickets={filteredTickets}
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

      {/* Bottom Navigation (Mobile Only) */}
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