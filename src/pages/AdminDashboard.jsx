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

  // Chargement des données au démarrage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketsData = await getAllTickets();
        const artisansData = await getArtisans();
        
        // On trie : les Urgents en premier [cite: 36]
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

  // Editer un artisan
  const handleEditArtisan = (artisan) => {
    setEditingArtisanId(artisan.id);
    setEditFormData({
      prenom: artisan.prenom,
      nom: artisan.nom,
      email: artisan.email,
      specialite: artisan.specialite
    });
  };

  // Mettre à jour un artisan
  const handleUpdateArtisan = async (artisanId) => {
    try {
      await updateArtisan(artisanId, editFormData);
      setArtisans(artisans.map(a => 
        a.id === artisanId 
          ? { ...a, ...editFormData }
          : a
      ));
      setEditingArtisanId(null);
      alert("Artisan modifié avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification");
    }
  };

  // Supprimer un artisan
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

  // Gestion du Dispatching (Assignation) [cite: 37]
  const handleAssign = async (ticketId, artisanId) => {
    if (!artisanId) return;
    
    // Trouver le nom de l'artisan sélectionné
    const selectedArtisan = artisans.find(a => a.id === artisanId);
    
    if (window.confirm(`Assigner ce ticket à ${selectedArtisan.prenom} ?`)) {
      try {
        await assignTicket(ticketId, artisanId, selectedArtisan.prenom);
        alert("Ticket assigné avec succès !");
        // Mise à jour locale de la liste pour voir le changement direct
        setTickets(tickets.map(t => 
          t.id === ticketId 
            ? { ...t, status: 'in_progress', assignedToName: selectedArtisan.prenom } 
            : t
        ));
      } catch (err) {
        alert("Erreur lors de l'assignation");
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (loading) return <div>Chargement du tableau de bord...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Admin Dashboard 🛠️</h1>
        <div style={styles.headerRight}>
             {/* Lien vers la page de création d'artisan (Section 3.2) */}
            <Link to="/admin/create-artisan" style={styles.linkBtn}>+ Ajouter Artisan</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
        </div>
      </header>

      <div style={styles.section}>
        <h2>Gestion des Artisans</h2>
        <div style={styles.artisansGrid}>
          {artisans.map(artisan => (
            <div key={artisan.id} style={styles.artisanCard}>
              {editingArtisanId === artisan.id ? (
                <div style={styles.editForm}>
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
                  <div style={styles.artisanInfo}>
                    <h3>{artisan.prenom} {artisan.nom}</h3>
                    <p><strong>Email:</strong> {artisan.email}</p>
                    <p><strong>Spécialité:</strong> {artisan.specialite}</p>
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
      </div>

      <div style={styles.section}>
        <h2>Liste des Tickets</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th>Urgence</th>
              <th>Lieu</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Assignation (Dispatch)</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} style={styles.tr}>
                {/* Colonne Urgence [cite: 24] */}
                <td>
                  {ticket.isUrgent ? (
                    <span style={styles.urgentBadge}>URGENT</span>
                  ) : (
                    <span style={styles.normalBadge}>Normal</span>
                  )}
                </td>
                <td>{ticket.location}</td>
                <td>{ticket.category}</td>
                <td style={{maxWidth: '200px'}}>{ticket.description}</td>
                
                {/* Colonne Statut [cite: 28] */}
                <td>
                  <span style={getStatusStyle(ticket.status)}>
                    {ticket.status === 'pending' ? 'En attente' : 
                     ticket.status === 'in_progress' ? 'En cours' : 'Terminé'}
                  </span>
                </td>

                {/* Colonne Dispatching [cite: 37] */}
                <td>
                  {ticket.status === 'completed' ? (
                    <span>Clôturé</span>
                  ) : ticket.assignedToName ? (
                    <strong>Chez : {ticket.assignedToName}</strong>
                  ) : (
                    <select 
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                      style={styles.select}
                      defaultValue=""
                    >
                      <option value="" disabled>Choisir un artisan...</option>
                      {artisans.map(artisan => (
                        <option key={artisan.id} value={artisan.id}>
                          {artisan.prenom} {artisan.nom} ({artisan.specialite})
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles utilitaires
const getStatusStyle = (status) => {
    const base = { padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' };
    if (status === 'pending') return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
    if (status === 'in_progress') return { ...base, backgroundColor: '#dbeafe', color: '#2563eb' };
    return { ...base, backgroundColor: '#dcfce7', color: '#16a34a' };
};

const styles = {
  container: { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  headerRight: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  section: { marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  artisansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '15px' },
  artisanCard: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  artisanInfo: { marginBottom: '12px' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' },
  buttonGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' },
  editBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#6b7280', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  thRow: { backgroundColor: '#f1f5f9', textAlign: 'left' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  select: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' },
  urgentBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' },
  normalBadge: { color: '#64748b', fontSize: '12px' },
  linkBtn: { textDecoration: 'none', backgroundColor: '#005596', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '14px'},
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer'}
};