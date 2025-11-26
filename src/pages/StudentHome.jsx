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
  const [filterStatus, setFilterStatus] = useState("all"); // Filtre par statut
  const [filterCategory, setFilterCategory] = useState("all"); // Filtre par catégorie
  const [sortBy, setSortBy] = useState("recent"); // Tri par date ou urgence

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

  // Filtrer et trier les tickets
  const getFilteredAndSortedTickets = () => {
    let filtered = tickets;

    // Appliquer le filtre de statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Appliquer le filtre de catégorie
    if (filterCategory !== "all") {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Appliquer le tri
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "urgent") {
      filtered.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
    }

    return filtered;
  };

  // Obtenir les catégories uniques
  const getCategories = () => {
    const categories = [...new Set(tickets.map(t => t.category))];
    return categories.sort();
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
        <div style={styles.listHeader}>
          <h2 style={styles.sectionTitle}>Mes Tickets</h2>
          <span style={styles.ticketCount}>{tickets.length}</span>
        </div>

        {/* Section de Filtrage */}
        <div style={styles.filterSection}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Statut:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="termine_artisan">À Valider</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Catégorie:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Toutes</option>
              {getCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Tri:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="recent">Plus récent</option>
              <option value="urgent">Urgents en premier</option>
            </select>
          </div>
        </div>
        
        {getFilteredAndSortedTickets().length === 0 ? (
          <div style={styles.emptyState}>Aucun ticket trouvé</div>
        ) : (
          getFilteredAndSortedTickets().map(ticket => {
            const statusInfo = getStatusInfo(ticket.status);
            return (
              <div key={ticket.id} style={styles.ticketCard}>
                <div style={{...styles.urgentIndicator, backgroundColor: ticket.isUrgent ? '#ef4444' : '#e5e7eb'}} />
                
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                      <span style={styles.categoryBadge}>{ticket.category}</span>
                      {ticket.isUrgent && <span style={styles.urgentBadge}>🚨 URGENT</span>}
                    </div>
                    <span style={{
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <p style={styles.description}>{ticket.description}</p>
                  
                  <p style={styles.location}>📍 {ticket.location}</p>
                  
                  <div style={styles.cardFooter}>
                    <span style={styles.date}>📅 {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                    
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
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  welcome: { fontSize: '22px', color: '#1f2937', margin: 0, fontWeight: 'bold' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '5px 0 0 0' },
  logoutBtn: { border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  actionArea: { marginBottom: '25px' },
  createBtn: { display: 'block', width: '100%', padding: '16px', backgroundColor: '#005596', color: 'white', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 8px rgba(0,85,150,0.2)' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  sectionTitle: { fontSize: '18px', color: '#1f2937', margin: 0, fontWeight: 'bold' },
  ticketCount: { backgroundColor: '#005596', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  
  // Styles du Filtrage
  filterSection: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  filterGroup: { display: 'flex', flexDirection: 'column' },
  filterLabel: { fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' },
  filterSelect: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' },
  
  // Styles des Tickets
  ticketCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', transition: 'transform 0.2s, box-shadow 0.2s' },
  urgentIndicator: { width: '4px', minHeight: '100%' },
  cardContent: { flex: 1, padding: '16px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' },
  headerLeft: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  categoryBadge: { fontSize: '12px', fontWeight: 'bold', color: '#005596', backgroundColor: '#dbeafe', padding: '4px 10px', borderRadius: '6px' },
  urgentBadge: { fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px' },
  description: { fontSize: '14px', color: '#1f2937', marginBottom: '8px', lineHeight: '1.4', margin: '0 0 8px 0' },
  location: { fontSize: '12px', color: '#6b7280', marginBottom: '10px', margin: '0 0 10px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', gap: '8px', flexWrap: 'wrap' },
  date: { fontSize: '12px', color: '#9ca3af' },
  
  // Boutons et Affichages
  validateBtn: { backgroundColor: '#7e22ce', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  ratingDisplay: { fontSize: '12px', fontWeight: 'bold', color: '#d97706' },
  
  emptyState: { backgroundColor: 'white', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', color: '#6b7280', fontSize: '15px' },
  loading: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '15px' },
  
  // Styles de la Modale (Popup)
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '10px', marginTop: '15px', color: '#1f2937' },
  starContainer: { marginBottom: '15px', display: 'flex', justifyContent: 'center', gap: '5px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', marginBottom: '20px', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  cancelBtn: { padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' },
  confirmBtn: { padding: '10px 20px', border: 'none', background: '#16a34a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};