import React, { useEffect, useState } from 'react';
import { getAllTickets, getArtisans, assignTicket } from '../services/adminService';
import { logoutUser } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  headerRight: { display: 'flex', gap: '15px'},
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  thRow: { backgroundColor: '#f1f5f9', textAlign: 'left' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  select: { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' },
  urgentBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' },
  normalBadge: { color: '#64748b', fontSize: '12px' },
  linkBtn: { textDecoration: 'none', backgroundColor: '#005596', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '14px'},
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer'}
};