import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getStudentTickets, validateTicket } from '../services/ticketService'; // Import validateTicket
import { logoutUser } from '../services/authService';
import { doc, getDoc } from 'firebase/firestore';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  // États pour la Notation (Rating)
  const [selectedTicket, setSelectedTicket] = useState(null); // Quel ticket on note ?
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = auth.currentUser;
    if (!user) return navigate('/login');

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setUserName(userDoc.data().prenom);

      const myTickets = await getStudentTickets(user.uid);
      setTickets(myTickets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  // Ouvrir la popup de notation
  const openValidation = (ticket) => {
    setSelectedTicket(ticket);
    setRating(5);
    setComment("");
  };

  // Envoyer la validation
  const submitValidation = async () => {
    if (!selectedTicket) return;
    try {
      await validateTicket(selectedTicket.id, rating, comment);
      alert("Merci pour votre retour ! Ticket clôturé.");
      setSelectedTicket(null); // Fermer la popup
      loadData(); // Recharger la liste pour voir le changement de statut
    } catch (err) {
      alert("Erreur lors de la validation.");
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': return { label: 'En attente', color: '#d97706', bg: '#fef3c7' };
      case 'in_progress': return { label: 'En cours', color: '#2563eb', bg: '#dbeafe' };
      
      // Nouveau statut intermédiaire (Artisan a fini, attend validation étudiant)
      case 'termine_artisan': return { label: 'À Valider', color: '#7e22ce', bg: '#f3e8ff' }; 
      
      case 'completed': return { label: 'Terminé', color: '#16a34a', bg: '#dcfce7' };
      default: return { label: status, color: '#374151', bg: '#f3f4f6' };
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcome}>Bonjour, {userName} 👋</h1>
          <p style={styles.subtitle}>Espace Résident</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </header>

      <div style={styles.actionArea}>
        <Link to="/create-ticket" style={styles.createBtn}>+ Signaler un problème</Link>
      </div>

      <div style={styles.ticketList}>
        <h2 style={styles.sectionTitle}>Mes Tickets</h2>
        
        {tickets.length === 0 ? (
          <div style={styles.emptyState}>Aucun ticket. Tout va bien !</div>
        ) : (
          tickets.map(ticket => {
            const statusInfo = getStatusInfo(ticket.status);
            return (
              <div key={ticket.id} style={styles.ticketCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.categoryBadge}>{ticket.category}</span>
                  <span style={{
                    backgroundColor: statusInfo.bg,
                    color: statusInfo.color,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <p style={styles.description}>{ticket.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.date}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  
                  {/* BOUTON DE VALIDATION (Visible seulement si l'artisan a fini) */}
                  {ticket.status === 'termine_artisan' && (
                    <button 
                      onClick={() => openValidation(ticket)}
                      style={styles.validateBtn}
                    >
                      ⭐ Valider & Noter
                    </button>
                  )}

                  {/* AFFICHER LA NOTE SI TERMINÉ */}
                  {ticket.status === 'completed' && ticket.rating && (
                    <span style={styles.ratingDisplay}>Note : {ticket.rating}/5 ⭐</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODALE DE VALIDATION (Simple Overlay) */}
      {selectedTicket && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3>Validation de l'intervention</h3>
            <p>Le problème "{selectedTicket.category}" est-il résolu ?</p>
            
            <label style={styles.label}>Votre Note (1 à 5) :</label>
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)}
                  style={{
                    cursor: 'pointer', 
                    fontSize: '24px', 
                    color: star <= rating ? '#fbbf24' : '#e5e7eb'
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea 
              placeholder="Un commentaire sur le service ?" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
            />

            <div style={styles.modalActions}>
              <button onClick={() => setSelectedTicket(null)} style={styles.cancelBtn}>Annuler</button>
              <button onClick={submitValidation} style={styles.confirmBtn}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // ... (Garde tes styles existants pour container, header, etc.)
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  welcome: { fontSize: '22px', color: '#1f2937', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  logoutBtn: { border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' },
  actionArea: { marginBottom: '20px' },
  createBtn: { display: 'block', width: '100%', padding: '15px', backgroundColor: '#005596', color: 'white', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  ticketCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  categoryBadge: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' },
  description: { fontSize: '14px', color: '#1f2937', marginBottom: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' },
  date: { fontSize: '12px', color: '#9ca3af' },
  
  // Nouveaux Styles pour la Validation
  validateBtn: { backgroundColor: '#7e22ce', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  ratingDisplay: { fontSize: '12px', fontWeight: 'bold', color: '#d97706' },
  
  // Styles de la Modale (Popup)
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '10px', marginTop: '15px' },
  starContainer: { marginBottom: '15px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '60px', marginBottom: '20px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  cancelBtn: { padding: '10px 20px', border: 'none', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer' },
  confirmBtn: { padding: '10px 20px', border: 'none', background: '#16a34a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};