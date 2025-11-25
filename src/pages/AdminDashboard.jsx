import React, { useState, useEffect } from 'react';
import { getAllTickets, assignTicket, getArtisans } from "../services/adminService";
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [artisans, setArtisans] = useState([]); // Liste des artisans
  const [loading, setLoading] = useState(true);
  
  // Gestion de l'assignation (quel ticket est en cours d'assignation ?)
  const [selectedTicketId, setSelectedTicketId] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const ticketsData = await getAllTickets();
    const artisansData = await getArtisans(); // On charge aussi les artisans
    setTickets(ticketsData);
    setArtisans(artisansData);
    setLoading(false);
  };

  // Quand l'admin choisit un nom dans la liste
  const handleAssignChange = async (ticketId, e) => {
    const artisanId = e.target.value;
    if (!artisanId) return;

    // On retrouve le nom complet grâce à l'ID
    const selectedArtisan = artisans.find(a => a.id === artisanId); // Chercher dans notre liste mémoire
    const nomComplet = `${selectedArtisan.prenom} ${selectedArtisan.nom}`;

    if (window.confirm(`Assigner ce ticket à ${nomComplet} ?`)) {
      await assignTicket(ticketId, artisanId, nomComplet);
      loadData(); // Rafraîchir
      setSelectedTicketId(null); // Fermer le menu
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{color: '#005596'}}>Pilotage Syndic</h1>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={{background: '#f1f5f9'}}>
              <th style={styles.th}>Titre</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Assignation</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={styles.td}>{ticket.titre}</td>
                <td style={styles.td}>{ticket.category}</td>
                <td style={styles.td}>{ticket.status}</td>
                
                <td style={styles.td}>
                  {/* LOGIQUE D'AFFICHAGE INTELLIGENTE */}
                  {ticket.status === 'en_attente' ? (
                    
                    // Si on a cliqué sur "Assigner", on montre la liste
                    selectedTicketId === ticket.id ? (
                      <select 
                        onChange={(e) => handleAssignChange(ticket.id, e)}
                        style={styles.select}
                        defaultValue=""
                      >
                        <option value="" disabled>Choisir un artisan...</option>
                        {artisans.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.prenom} {a.nom}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Sinon on montre le bouton
                      <button 
                        onClick={() => setSelectedTicketId(ticket.id)}
                        style={styles.btn}
                      >
                        Assigner
                      </button>
                    )

                  ) : (
                    // Si déjà assigné
                    <span style={{color: '#005596', fontWeight: 'bold'}}>
                      👤 {ticket.assignedTo}
                    </span>
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

const styles = {
  container: { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' },
  tableContainer: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', textAlign: 'left', color: '#64748b' },
  td: { padding: '15px', color: '#334155' },
  btn: { background: '#005596', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  select: { padding: '6px', borderRadius: '4px', borderColor: '#ccc' }
};