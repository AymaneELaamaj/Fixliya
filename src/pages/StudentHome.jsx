import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getStudentTickets } from '../services/ticketService';
import { logoutUser } from '../services/authService';
import { doc, getDoc } from 'firebase/firestore';

export default function StudentHome() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Vérifier auth
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // 2. Récupérer le nom de l'étudiant pour l'accueil
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().prenom);
        }

        // 3. Récupérer ses tickets
        const myTickets = await getStudentTickets(user.uid);
        setTickets(myTickets);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  // Fonction utilitaire pour la couleur des statuts (Barre de progression visuelle - Sec 2.3)
  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fef3c7', text: '#d97706', label: 'En attente' }; // Jaune
      case 'in_progress': return { bg: '#dbeafe', text: '#2563eb', label: 'Pris en charge' }; // Bleu
      case 'completed': return { bg: '#dcfce7', text: '#16a34a', label: 'Terminé' }; // Vert
      default: return { bg: '#f3f4f6', text: '#374151', label: status };
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcome}>Bonjour, {userName} 👋</h1>
          <p style={styles.subtitle}>Suivez vos demandes d'intervention</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </header>

      {/* Bouton d'action principal */}
      <div style={styles.actionArea}>
        <Link to="/create-ticket" style={styles.createBtn}>
          + Signaler un problème
        </Link>
      </div>

      {/* Liste des tickets (Sec 2.3) */}
      <div style={styles.ticketList}>
        <h2 style={styles.sectionTitle}>Mes Tickets Récents</h2>
        
        {tickets.length === 0 ? (
          <div style={styles.emptyState}>Aucun ticket pour le moment.</div>
        ) : (
          tickets.map(ticket => {
            const statusStyle = getStatusStyle(ticket.status);
            return (
              <div key={ticket.id} style={styles.ticketCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.categoryBadge}>{ticket.category}</span>
                  {ticket.isUrgent && <span style={styles.urgentBadge}>URGENT</span>}
                </div>
                
                <p style={styles.description}>{ticket.description}</p>
                <p style={styles.location}>📍 {ticket.location}</p>

                <div style={styles.cardFooter}>
                  <span style={styles.date}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* Barre de statut visuelle */}
                  <span style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' },
  loading: { display: 'flex', justifyContent: 'center', marginTop: '50px', color: '#666' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  welcome: { fontSize: '22px', color: '#1f2937', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '5px' },
  logoutBtn: { border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  
  actionArea: { marginBottom: '25px' },
  createBtn: { display: 'block', width: '100%', padding: '15px', backgroundColor: '#005596', color: 'white', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(0, 85, 150, 0.2)' },
  
  sectionTitle: { fontSize: '18px', color: '#374151', marginBottom: '15px' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  emptyState: { textAlign: 'center', color: '#9ca3af', marginTop: '20px' },
  
  ticketCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  categoryBadge: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' },
  urgentBadge: { fontSize: '10px', fontWeight: 'bold', color: 'white', backgroundColor: '#ef4444', padding: '4px 8px', borderRadius: '6px' },
  description: { fontSize: '14px', color: '#1f2937', margin: '0 0 10px 0', lineHeight: '1.4' },
  location: { fontSize: '12px', color: '#6b7280', marginBottom: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '10px' },
  date: { fontSize: '12px', color: '#9ca3af' }
};