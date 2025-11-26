import React, { useEffect, useState } from 'react';
import { getAllTickets, getArtisans, assignTicket, updateArtisan, deleteArtisan } from '../services/adminService';
import { logoutUser } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArtisanId, setEditingArtisanId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState("tickets");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgent, setFilterUrgent] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketsData = await getAllTickets();
        const artisansData = await getArtisans();
        const sortedTickets = ticketsData.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
        setTickets(sortedTickets);
        setArtisans(artisansData);
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
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
          🚪 Déconnexion
        </button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === "tickets" ? "📋 Gestion des Tickets" : "👨‍🔧 Gestion des Artisans"}
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
                    <th style={styles.thCell}>Statut</th>
                    <th style={styles.thCell}>Assigné à</th>
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
                        <span style={getStatusStyle(ticket.status)}>
                          {ticket.status === 'pending' ? '⏳ Attente' : 
                           ticket.status === 'in_progress' ? '⚙️ En cours' : 
                           ticket.status === 'termine_artisan' ? '✅ Terminé' : '🏁 Clôturé'}
                        </span>
                      </td>
                      <td style={styles.tdCell}>
                        {ticket.status === 'completed' ? (
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>Clôturé</span>
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
      </main>
    </div>
  );
}

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
  }
};
