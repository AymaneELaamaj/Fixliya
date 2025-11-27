import React, { useEffect, useState } from 'react';
import { getAllTickets, getArtisans, assignTicket, updateArtisan, deleteArtisan, getStatistics, getStudents, toggleStudentStatus, getExternalProviders, externalizeTicket } from '../services/adminService';
import { logoutUser } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [externalProviders, setExternalProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArtisanId, setEditingArtisanId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("tickets");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgent, setFilterUrgent] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [statistics, setStatistics] = useState(null);
  const [students, setStudents] = useState([]);
  const [filterStudentStatus, setFilterStudentStatus] = useState("all");
  const [showExternalizeModal, setShowExternalizeModal] = useState(false);
  const [selectedTicketForExternalize, setSelectedTicketForExternalize] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketsData = await getAllTickets();
        const artisansData = await getArtisans();
        const statsData = await getStatistics();
        const studentsData = await getStudents();
        const providersData = await getExternalProviders();
        const sortedTickets = ticketsData.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
        setTickets(sortedTickets);
        setArtisans(artisansData);
        setExternalProviders(providersData);

        setStatistics(statsData);
        setStudents(studentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditArtisan = (artisan) => {
    setEditingArtisanId(artisan.id);
    setEditFormData({
      prenom: artisan.prenom,
      nom: artisan.nom,
      email: artisan.email,
      telephone: artisan.telephone || "",
      specialite: artisan.specialite
    });
  };

  const handleUpdateArtisan = async (artisanId) => {
    try {
      await updateArtisan(artisanId, editFormData);
      setArtisans(artisans.map(a => 
        a.id === artisanId ? { ...a, ...editFormData } : a
      ));
      setEditingArtisanId(null);
      alert("Artisan modifié avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification");
    }
  };

  const handleDeleteArtisan = async (artisanId, artisanName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${artisanName} ?`)) {
      try {
        await deleteArtisan(artisanId);
        setArtisans(artisans.filter(a => a.id !== artisanId));
        alert("Artisan supprimé avec succès !");
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleAssign = async (ticketId, artisanId) => {
    if (!artisanId) return;
    
    // Vérifier si le ticket est annulé
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.status === 'cancelled') {
      alert("Ce ticket a été annulé. Vous ne pouvez pas l'assigner.");
      return;
    }
    
    const selectedArtisan = artisans.find(a => a.id === artisanId);
    if (window.confirm(`Assigner ce ticket à ${selectedArtisan.prenom} ?`)) {
      try {
        await assignTicket(ticketId, artisanId, selectedArtisan.prenom);
        alert("Ticket assigné avec succès !");
        setTickets(tickets.map(t => 
          t.id === ticketId ? { ...t, status: 'in_progress', assignedToName: selectedArtisan.prenom } : t
        ));
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'assignation");
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    try {
      await toggleStudentStatus(studentId, currentStatus);
      setStudents(students.map(s =>
        s.id === studentId ? { ...s, isActive: !s.isActive } : s
      ));
      alert(currentStatus ? "Compte désactivé" : "Compte activé");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleExternalizeClick = (ticket) => {
    setSelectedTicketForExternalize(ticket);
    setShowExternalizeModal(true);
  };

  const handleExternalizeTicket = async (providerId) => {
    if (!selectedTicketForExternalize || !providerId) return;

    const selectedProvider = externalProviders.find(p => p.id === providerId);
    if (!selectedProvider) return;

    try {
      await externalizeTicket(selectedTicketForExternalize.id, providerId, {
        name: selectedProvider.name,
        phone: selectedProvider.phone,
        email: selectedProvider.email
      });

      alert(`Ticket externalisé avec succès à ${selectedProvider.name} !`);
      setTickets(tickets.map(t => 
        t.id === selectedTicketForExternalize.id 
          ? { 
              ...t, 
              status: 'externalized',
              isExternalized: true,
              externalizedToName: selectedProvider.name,
              assignedToName: null,
              assignedToId: null
            } 
          : t
      ));
      setShowExternalizeModal(false);
      setSelectedTicketForExternalize(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'externalisation");
    }
  };

  const getFilteredAndSortedTickets = () => {
    let filtered = tickets.filter(ticket => {
      const statusMatch = filterStatus === "all" || ticket.status === filterStatus;
      const categoryMatch = filterCategory === "all" || ticket.category === filterCategory;
      const urgentMatch = filterUrgent === "all" || (filterUrgent === "urgent" ? ticket.isUrgent : !ticket.isUrgent);
      return statusMatch && categoryMatch && urgentMatch;
    });

    if (sortBy === "urgent") {
      filtered.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return filtered;
  };

  const getCategories = () => {
    const categories = [...new Set(tickets.map(t => t.category))];
    return categories.filter(c => c);
  };

  if (loading) return <div style={styles.loadingContainer}>Chargement du tableau de bord...</div>;

  const filteredTickets = getFilteredAndSortedTickets();
  const categories = getCategories();

  return (
    <div style={styles.pageContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>🛠️ Admin</h2>
        </div>
        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab("tickets")}
            style={activeTab === "tickets" ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            📋 Gérer les Tickets
          </button>
          <button 
            onClick={() => setActiveTab("artisans")}
            style={activeTab === "artisans" ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            👨‍🔧 Gérer les Artisans
          </button>
          <button 
            onClick={() => setActiveTab("statistics")}
            style={activeTab === "statistics" ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            📊 Statistiques & Rapports
          </button>
          <button 
            onClick={() => setActiveTab("students")}
            style={activeTab === "students" ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
          >
            👨‍🎓 Gestion Étudiants
          </button>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
          🚪 Déconnexion
        </button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === "tickets" ? "📋 Gestion des Tickets" : 
             activeTab === "artisans" ? "👨‍🔧 Gestion des Artisans" :
             activeTab === "statistics" ? "📊 Statistiques & Rapports" :
             "👨‍🎓 Gestion des Étudiants"}
          </h1>
          {activeTab === "artisans" && (
            <Link to="/admin/create-artisan" style={styles.addBtn}>+ Ajouter Artisan</Link>
          )}
        </header>

        {activeTab === "tickets" && (
          <div style={styles.section}>
            <div style={styles.filterBar}>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="termine_artisan">Terminé (artisan)</option>
                <option value="completed">Clôturé</option>
                <option value="cancelled">Annulé</option>
              </select>

              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={styles.filterSelect}>
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select value={filterUrgent} onChange={(e) => setFilterUrgent(e.target.value)} style={styles.filterSelect}>
                <option value="all">Tous les tickets</option>
                <option value="urgent">Urgent uniquement</option>
                <option value="normal">Normal uniquement</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
                <option value="recent">Plus récents</option>
                <option value="urgent">Urgent d'abord</option>
              </select>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.thCell}>Urgence</th>
                    <th style={styles.thCell}>Catégorie</th>
                    <th style={styles.thCell}>Lieu</th>
                    <th style={styles.thCell}>Description</th>
                    <th style={styles.thCell}>Planification</th>
                    <th style={styles.thCell}>Statut</th>
                    <th style={styles.thCell}>Assigné à</th>
                    <th style={styles.thCell}>Actions</th>
                    <th style={styles.thCell}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} style={styles.tr}>
                      <td style={styles.tdCell}>
                        {ticket.isUrgent ? (
                          <span style={styles.urgentBadge}>🔴 URGENT</span>
                        ) : (
                          <span style={styles.normalBadge}>⚪ Normal</span>
                        )}
                      </td>
                      <td style={styles.tdCell}>
                        <span style={styles.categoryBadge}>{ticket.category}</span>
                      </td>
                      <td style={styles.tdCell}>{ticket.location || "N/A"}</td>
                      <td style={{...styles.tdCell, ...styles.descriptionCell}}>{ticket.description}</td>
                      <td style={styles.tdCell}>
                        {ticket.ticketType === 'planifier' && ticket.scheduledDate ? (
                          <div style={styles.planificationInfo}>
                            <div>📅 {ticket.scheduledDate}</div>
                            {ticket.scheduledTime && <div>⏰ {ticket.scheduledTime}</div>}
                          </div>
                        ) : ticket.isUrgent ? (
                          <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🚨 Urgent</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={styles.tdCell}>
                        <span style={getStatusStyle(ticket.status)}>
                          {ticket.status === 'pending' ? '⏳ Attente' : 
                           ticket.status === 'in_progress' ? '⚙️ En cours' : 
                           ticket.status === 'termine_artisan' ? '✅ Terminé' :
                           ticket.status === 'cancelled' ? '❌ Annulé' :
                           ticket.status === 'externalized' ? '🌐 Externalisé' : '🏁 Clôturé'}
                        </span>
                      </td>
                      <td style={styles.tdCell}>
                        {ticket.status === 'completed' ? (
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>Clôturé</span>
                        ) : ticket.status === 'cancelled' ? (
                          <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>Annulé</span>
                        ) : ticket.status === 'externalized' ? (
                          <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 'bold' }}>🌐 {ticket.externalizedToName}</span>
                        ) : ticket.assignedToName ? (
                          <strong style={{ color: '#059669' }}>✓ {ticket.assignedToName}</strong>
                        ) : (
                          <select 
                            onChange={(e) => handleAssign(ticket.id, e.target.value)}
                            style={styles.selectSmall}
                            defaultValue=""
                          >
                            <option value="" disabled>Assigner...</option>
                            {artisans.map(artisan => (
                              <option key={artisan.id} value={artisan.id}>
                                {artisan.prenom} ({artisan.specialite})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td style={styles.tdCell}>
                        {ticket.status === 'completed' || ticket.status === 'cancelled' ? (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                        ) : ticket.isExternalized ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={styles.externalizedBadge}>🌐 {ticket.externalizedToName}</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleExternalizeClick(ticket)}
                            style={styles.externalizeBtn}
                            title="Externaliser vers prestataire agréé"
                          >
                            🌐 Externaliser
                          </button>
                        )}
                      </td>
                      <td style={styles.tdCell}>
                        <span style={styles.count}>{ticket.id.substring(0, 8)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.ticketCount}>
              📊 Total: <strong>{filteredTickets.length}</strong> ticket(s)
            </div>
          </div>
        )}

        {activeTab === "artisans" && (
          <div style={styles.section}>
            <div style={styles.artisansGrid}>
              {artisans.map(artisan => (
                <div key={artisan.id} style={styles.artisanCard}>
                  {editingArtisanId === artisan.id ? (
                    <div style={styles.editForm}>
                      <h3 style={styles.editTitle}>Modifier Artisan</h3>
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={editFormData.prenom}
                        onChange={(e) => setEditFormData({...editFormData, prenom: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={editFormData.nom}
                        onChange={(e) => setEditFormData({...editFormData, nom: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="tel"
                        placeholder="Téléphone"
                        value={editFormData.telephone}
                        onChange={(e) => setEditFormData({...editFormData, telephone: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Spécialité"
                        value={editFormData.specialite}
                        onChange={(e) => setEditFormData({...editFormData, specialite: e.target.value})}
                        style={styles.input}
                      />
                      <div style={styles.buttonGroup}>
                        <button onClick={() => handleUpdateArtisan(artisan.id)} style={styles.saveBtn}>✓ Enregistrer</button>
                        <button onClick={() => setEditingArtisanId(null)} style={styles.cancelBtn}>✕ Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={styles.artisanBadge}>👨‍🔧</div>
                      <div style={styles.artisanInfo}>
                        <h3 style={styles.artisanName}>{artisan.prenom} {artisan.nom}</h3>
                        <p style={styles.artisanDetail}>
                          <strong>Email:</strong> {artisan.email}
                        </p>
                        <p style={styles.artisanDetail}>
                          <strong>Tel:</strong> {artisan.telephone || "N/A"}
                        </p>
                        <p style={styles.artisanDetail}>
                          <strong>Spécialité:</strong> <span style={styles.specialiteBadge}>{artisan.specialite}</span>
                        </p>
                      </div>
                      <div style={styles.buttonGroup}>
                        <button onClick={() => handleEditArtisan(artisan)} style={styles.editBtn}>✏️ Modifier</button>
                        <button onClick={() => handleDeleteArtisan(artisan.id, artisan.prenom)} style={styles.deleteBtn}>🗑️ Supprimer</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {artisans.length === 0 && (
              <div style={styles.emptyState}>
                <p>📭 Aucun artisan trouvé. <Link to="/admin/create-artisan" style={styles.addArtisanLink}>Ajouter un artisan</Link></p>
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div style={styles.section}>
            {students.length === 0 ? (
              <div style={styles.emptyState}>
                <p>📭 Aucun étudiant trouvé</p>
              </div>
            ) : (
              <div>
                <div style={styles.filterBar}>
                  <select value={filterStudentStatus} onChange={(e) => setFilterStudentStatus(e.target.value)} style={styles.filterSelect}>
                    <option value="all">Tous les étudiants</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Désactivés</option>
                  </select>
                </div>

                <div style={styles.studentsGrid}>
                  {students
                    .filter(student => {
                      if (filterStudentStatus === "active") return student.isActive;
                      if (filterStudentStatus === "inactive") return !student.isActive;
                      return true;
                    })
                    .map(student => (
                      <div key={student.id} style={styles.studentCard}>
                        <div style={styles.studentHeader}>
                          <div style={styles.studentAvatar}>👨‍🎓</div>
                          <div style={styles.studentStatus}>
                            {student.isActive ? (
                              <span style={styles.activeBadge}>✓ Actif</span>
                            ) : (
                              <span style={styles.inactiveBadge}>✗ Inactif</span>
                            )}
                          </div>
                        </div>
                        
                        <div style={styles.studentInfo}>
                          <h3 style={styles.studentName}>{student.prenom} {student.nom}</h3>
                          <p style={styles.studentDetail}>
                            <strong>Email:</strong> {student.email}
                          </p>
                          <p style={styles.studentDetail}>
                            <strong>Tél:</strong> {student.telephone || "N/A"}
                          </p>
                        </div>

                        <div style={styles.ticketsStats}>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Total</span>
                            <span style={styles.statValue}>{student.totalTickets}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>En attente</span>
                            <span style={{...styles.statValue, color: '#f59e0b'}}>{student.pendingTickets}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>En cours</span>
                            <span style={{...styles.statValue, color: '#3b82f6'}}>{student.inProgressTickets}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Complétés</span>
                            <span style={{...styles.statValue, color: '#10b981'}}>{student.completedTickets}</span>
                          </div>
                        </div>

                        <div style={styles.studentActions}>
                          <button
                            onClick={() => handleToggleStudentStatus(student.id, student.isActive)}
                            style={student.isActive ? styles.deactivateBtn : styles.activateBtn}
                          >
                            {student.isActive ? "🔒 Désactiver" : "✓ Activer"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "statistics" && (
          <div style={styles.section}>
            {!statistics ? (
              <div style={styles.loadingText}>Chargement des statistiques...</div>
            ) : (
              <div>
                {/* Cards d'overview */}
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}>📌</div>
                    <div style={styles.metricContent}>
                      <h3 style={styles.metricLabel}>Total Interventions</h3>
                      <p style={styles.metricValue}>{statistics.totalTickets}</p>
                    </div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}>⏳</div>
                    <div style={styles.metricContent}>
                      <h3 style={styles.metricLabel}>Temps Moyen Réponse</h3>
                      <p style={styles.metricValue}>{statistics.averageResponseTime}h</p>
                    </div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}>✅</div>
                    <div style={styles.metricContent}>
                      <h3 style={styles.metricLabel}>Complétées</h3>
                      <p style={styles.metricValue}>{statistics.statusCounts.completed}</p>
                    </div>
                  </div>

                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}>⚙️</div>
                    <div style={styles.metricContent}>
                      <h3 style={styles.metricLabel}>En Cours</h3>
                      <p style={styles.metricValue}>{statistics.statusCounts.in_progress}</p>
                    </div>
                  </div>
                </div>

                {/* Statuts détaillés */}
                <div style={styles.statisticsContainer}>
                  <div style={styles.chartSection}>
                    <h3 style={styles.chartTitle}>📊 Distribution des Statuts</h3>
                    <div style={styles.statusGrid}>
                      <div style={styles.statusItem}>
                        <span style={styles.statusLabel}>En Attente</span>
                        <div style={styles.statusBar}>
                          <div style={{...styles.statusFill, width: `${(statistics.statusCounts.pending / statistics.totalTickets * 100) || 0}%`, backgroundColor: '#fbbf24'}}></div>
                        </div>
                        <span style={styles.statusCount}>{statistics.statusCounts.pending}</span>
                      </div>
                      <div style={styles.statusItem}>
                        <span style={styles.statusLabel}>En Cours</span>
                        <div style={styles.statusBar}>
                          <div style={{...styles.statusFill, width: `${(statistics.statusCounts.in_progress / statistics.totalTickets * 100) || 0}%`, backgroundColor: '#3b82f6'}}></div>
                        </div>
                        <span style={styles.statusCount}>{statistics.statusCounts.in_progress}</span>
                      </div>
                      <div style={styles.statusItem}>
                        <span style={styles.statusLabel}>Terminé (Artisan)</span>
                        <div style={styles.statusBar}>
                          <div style={{...styles.statusFill, width: `${(statistics.statusCounts.termine_artisan / statistics.totalTickets * 100) || 0}%`, backgroundColor: '#10b981'}}></div>
                        </div>
                        <span style={styles.statusCount}>{statistics.statusCounts.termine_artisan}</span>
                      </div>
                      <div style={styles.statusItem}>
                        <span style={styles.statusLabel}>Clôturé</span>
                        <div style={styles.statusBar}>
                          <div style={{...styles.statusFill, width: `${(statistics.statusCounts.completed / statistics.totalTickets * 100) || 0}%`, backgroundColor: '#06b6d4'}}></div>
                        </div>
                        <span style={styles.statusCount}>{statistics.statusCounts.completed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top catégories */}
                  <div style={styles.chartSection}>
                    <h3 style={styles.chartTitle}>🏆 Top 5 Catégories de Pannes</h3>
                    <div style={styles.categoriesContainer}>
                      {statistics.topCategories.map((item, idx) => (
                        <div key={idx} style={styles.categoryRow}>
                          <span style={styles.categoryRank}>{idx + 1}.</span>
                          <span style={styles.categoryName}>{item.category}</span>
                          <div style={styles.categoryBar}>
                            <div style={{
                              ...styles.categoryBarFill,
                              width: `${(item.count / statistics.topCategories[0].count * 100)}%`
                            }}></div>
                          </div>
                          <span style={styles.categoryValue}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interventions par mois */}
                  <div style={styles.chartSection}>
                    <h3 style={styles.chartTitle}>📈 Interventions par Mois</h3>
                    <div style={styles.monthlyContainer}>
                      {Object.entries(statistics.interventionsByMonth)
                        .sort()
                        .slice(-6)
                        .map(([month, count]) => {
                          const maxCount = Math.max(...Object.values(statistics.interventionsByMonth));
                          const height = (count / maxCount) * 150;
                          return (
                            <div key={month} style={styles.barContainer}>
                              <div style={{...styles.bar, height: `${height}px`}}></div>
                              <span style={styles.monthLabel}>{month}</span>
                              <span style={styles.barValue}>{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Externalisation */}
      {showExternalizeModal && selectedTicketForExternalize && (
        <div style={styles.modalOverlay} onClick={() => setShowExternalizeModal(false)}>
          <div style={styles.externalizeModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🌐 Externaliser le Ticket</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowExternalizeModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.ticketSummary}>
                <h3 style={styles.summaryTitle}>Détails du Ticket</h3>
                <div style={styles.summaryItem}>
                  <strong>Catégorie:</strong> {selectedTicketForExternalize.category}
                </div>
                <div style={styles.summaryItem}>
                  <strong>Description:</strong> {selectedTicketForExternalize.description}
                </div>
                <div style={styles.summaryItem}>
                  <strong>Lieu:</strong> {selectedTicketForExternalize.location}
                </div>
                <div style={styles.summaryItem}>
                  <strong>Urgence:</strong> {selectedTicketForExternalize.isUrgent ? '🔴 URGENT' : '⚪ Normal'}
                </div>
              </div>

              <div style={styles.providersSection}>
                <h3 style={styles.sectionTitle}>Sélectionner un Prestataire</h3>
                {externalProviders.length === 0 ? (
                  <div style={styles.noProviders}>
                    <p>Aucun prestataire externe disponible</p>
                  </div>
                ) : (
                  <div style={styles.providersList}>
                    {externalProviders.map(provider => (
                      <div key={provider.id} style={styles.providerOption}>
                        <div style={styles.providerInfo}>
                          <h4 style={styles.providerName}>{provider.name}</h4>
                          <p style={styles.providerDetail}>📧 {provider.email}</p>
                          <p style={styles.providerDetail}>📞 {provider.phone}</p>
                          {provider.specialties && provider.specialties.length > 0 && (
                            <p style={styles.providerDetail}>🛠️ {provider.specialties.join(', ')}</p>
                          )}
                          {provider.rating && (
                            <p style={styles.providerDetail}>⭐ {provider.rating}/5</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleExternalizeTicket(provider.id)}
                          style={styles.selectProviderBtn}
                        >
                          Sélectionner
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusStyle = (status) => {
  const base = { 
    padding: '6px 10px', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    fontSize: '12px',
    display: 'inline-block'
  };
  if (status === 'pending') return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
  if (status === 'in_progress') return { ...base, backgroundColor: '#dbeafe', color: '#2563eb' };
  if (status === 'termine_artisan') return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
  if (status === 'cancelled') return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
  if (status === 'externalized') return { ...base, backgroundColor: '#ede9fe', color: '#7c3aed' };
  return { ...base, backgroundColor: '#dcfce7', color: '#16a34a' };
};

const styles = {
  pageContainer: { 
    display: 'flex', 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc' 
  },
  sidebar: { 
    width: '250px', 
    backgroundColor: '#1e293b', 
    color: 'white', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto'
  },
  sidebarHeader: { 
    marginBottom: '30px', 
    borderBottom: '2px solid #005596', 
    paddingBottom: '15px' 
  },
  sidebarTitle: { 
    margin: 0, 
    fontSize: '20px', 
    fontWeight: 'bold',
    color: '#005596'
  },
  nav: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    flex: 1 
  },
  navButton: { 
    backgroundColor: 'transparent', 
    color: '#cbd5e1', 
    border: '2px solid transparent', 
    padding: '12px 15px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  navButtonActive: { 
    backgroundColor: '#005596', 
    color: 'white', 
    borderColor: '#005596' 
  },
  logoutBtnSidebar: { 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    padding: '10px 15px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: 'auto'
  },
  mainContent: { 
    flex: 1, 
    padding: '30px',
    overflowY: 'auto'
  },
  loadingContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    fontSize: '18px',
    color: '#64748b'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '15px'
  },
  pageTitle: { 
    margin: 0, 
    fontSize: '28px', 
    color: '#1e293b',
    fontWeight: 'bold'
  },
  addBtn: { 
    textDecoration: 'none', 
    backgroundColor: '#005596', 
    color: 'white', 
    padding: '10px 18px', 
    borderRadius: '6px', 
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  section: { 
    backgroundColor: 'white', 
    padding: '25px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '30px'
  },
  filterBar: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '15px', 
    marginBottom: '25px',
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderRadius: '6px'
  },
  filterSelect: { 
    padding: '10px 12px', 
    borderRadius: '6px', 
    border: '1px solid #cbd5e1', 
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.3s'
  },
  tableContainer: { 
    overflowX: 'auto',
    marginBottom: '15px',
    borderRadius: '8px'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    backgroundColor: 'white',
    border: '1px solid #e2e8f0'
  },
  thRow: { 
    backgroundColor: '#f1f5f9',
    borderBottom: '2px solid #cbd5e1'
  },
  thCell: { 
    padding: '12px 15px', 
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: '13px'
  },
  tr: { 
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s'
  },
  tdCell: { 
    padding: '12px 15px',
    fontSize: '13px',
    color: '#475569'
  },
  descriptionCell: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  selectSmall: { 
    padding: '6px 8px', 
    borderRadius: '4px', 
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    cursor: 'pointer'
  },
  urgentBadge: { 
    backgroundColor: '#fee2e2', 
    color: '#dc2626', 
    padding: '6px 10px', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    fontSize: '12px',
    display: 'inline-block'
  },
  normalBadge: { 
    backgroundColor: '#f3f4f6',
    color: '#64748b', 
    padding: '6px 10px', 
    borderRadius: '6px',
    fontSize: '12px',
    display: 'inline-block'
  },
  categoryBadge: { 
    backgroundColor: '#dbeafe', 
    color: '#2563eb',
    padding: '6px 10px', 
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block'
  },
  count: { 
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  ticketCount: { 
    textAlign: 'right',
    color: '#64748b',
    fontSize: '14px',
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px'
  },
  artisansGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '20px', 
    marginTop: '15px' 
  },
  artisanCard: { 
    backgroundColor: '#f9fafb', 
    padding: '20px', 
    borderRadius: '8px', 
    border: '1px solid #e5e7eb', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  artisanBadge: { 
    position: 'absolute',
    top: '12px',
    right: '15px',
    fontSize: '32px'
  },
  artisanInfo: { 
    marginBottom: '15px' 
  },
  artisanName: { 
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  artisanDetail: { 
    margin: '6px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  specialiteBadge: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  editForm: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  editTitle: { 
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  input: { 
    padding: '10px', 
    borderRadius: '6px', 
    border: '1px solid #cbd5e1', 
    fontSize: '14px',
    transition: 'border-color 0.3s'
  },
  buttonGroup: { 
    display: 'flex', 
    gap: '8px', 
    justifyContent: 'flex-end', 
    flexWrap: 'wrap' 
  },
  editBtn: { 
    backgroundColor: '#3b82f6', 
    color: 'white', 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  deleteBtn: { 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  saveBtn: { 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  cancelBtn: { 
    backgroundColor: '#6b7280', 
    color: 'white', 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '6px'
  },
  addArtisanLink: {
    color: '#005596',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease'
  },
  metricIcon: {
    fontSize: '32px',
    minWidth: '50px',
    textAlign: 'center'
  },
  metricContent: {
    flex: 1
  },
  metricLabel: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  metricValue: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#005596'
  },
  statisticsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px'
  },
  chartSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  chartTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  statusGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusLabel: {
    minWidth: '120px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569'
  },
  statusBar: {
    flex: 1,
    height: '24px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  statusFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  statusCount: {
    minWidth: '40px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  categoriesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px'
  },
  categoryRank: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#005596',
    minWidth: '30px'
  },
  categoryName: {
    minWidth: '100px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569'
  },
  categoryBar: {
    flex: 1,
    height: '20px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  categoryValue: {
    minWidth: '40px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  monthlyContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '10px',
    height: '200px',
    padding: '10px 0'
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  bar: {
    width: '100%',
    backgroundColor: '#005596',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s ease',
    minHeight: '10px'
  },
  monthLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    whiteSpace: 'nowrap'
  },
  barValue: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  loadingText: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    fontSize: '16px'
  },
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginTop: '15px'
  },
  studentCard: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px'
  },
  studentAvatar: {
    fontSize: '28px'
  },
  studentStatus: {
    display: 'flex'
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  studentDetail: {
    margin: '6px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  ticketsStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#005596'
  },
  studentActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  activateBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  deactivateBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  planificationInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px 10px',
    backgroundColor: '#f0f9ff',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#0369a1',
    fontWeight: '500',
    border: '1px solid #bae6fd'
  },
  externalizeBtn: {
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  externalizedBadge: {
    backgroundColor: '#ede9fe',
    color: '#7c3aed',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #ddd6fe'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  externalizeModal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '700px',
    maxHeight: '80vh',
    overflowY: 'auto',
    width: '90%'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #e2e8f0',
    padding: '20px',
    backgroundColor: '#f9fafb'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalContent: {
    padding: '20px'
  },
  ticketSummary: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '20px'
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0369a1'
  },
  summaryItem: {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '8px',
    padding: '6px 0',
    borderBottom: '1px solid #bae6fd'
  },
  providersSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  noProviders: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    color: '#64748b'
  },
  providersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  providerOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s ease'
  },
  providerInfo: {
    flex: 1
  },
  providerName: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  providerDetail: {
    margin: '4px 0',
    fontSize: '12px',
    color: '#64748b'
  },
  selectProviderBtn: {
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    marginLeft: '12px',
    whiteSpace: 'nowrap'
  }
};