import React, { useState, useEffect } from 'react';
import { getMyMissions, getArtisanHistory, completeMission } from "../services/artisanService"; // Importe la nouvelle fonction
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function ArtisanHome() {
  const [activeTab, setActiveTab] = useState('todo'); // 'todo' ou 'history'
  const [missions, setMissions] = useState([]);
  const [history, setHistory] = useState([]); // Pour stocker les avis
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadData(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      // 1. Charger les missions en cours
      const todoData = await getMyMissions(uid);
      setMissions(todoData);
      
      // 2. Charger l'historique (Avis)
      const historyData = await getArtisanHistory(uid);
      setHistory(historyData);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (id) => {
    if (window.confirm("Confirmer la fin de l'intervention ?")) {
      await completeMission(id);
      if (auth.currentUser) loadData(auth.currentUser.uid); // Rafraîchir
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.topBar}>
        <h1 style={{color: '#005596', margin: 0}}>Espace Artisan 🛠️</h1>
        <button onClick={handleLogout} style={styles.logoutLink}>Déconnexion</button>
      </div>

      {/* Onglets de Navigation */}
      <div style={styles.tabs}>
        <button 
          style={activeTab === 'todo' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('todo')}
        >
          Ma Journée ({missions.length})
        </button>
        <button 
          style={activeTab === 'history' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('history')}
        >
          Historique & Avis
        </button>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', marginTop: '20px'}}>Chargement...</p>
      ) : (
        <>
          {/* VUE 1 : MA JOURNÉE (Missions en cours) */}
          {activeTab === 'todo' && (
            <div style={styles.list}>
              {missions.length === 0 ? (
                <div style={styles.empty}>
                  <h2>Aucune mission active !</h2>
                  <p>En attente de dispatch... ☕</p>
                </div>
              ) : (
                missions.map(mission => (
                  <div key={mission.id} style={styles.card}>
                    <div style={styles.header}>
                      <span style={styles.tag}>{mission.category}</span>
                      {mission.isUrgent && <span style={styles.urgentBadge}>URGENT</span>}
                    </div>
                    <div style={styles.locationRow}>📍 {mission.location}</div>
                    <p style={styles.desc}>{mission.description}</p>
                    <div style={styles.studentInfo}>👤 Étudiant : {mission.studentName}</div>
                    
                    <button onClick={() => handleFinish(mission.id)} style={styles.btnFinish}>
                      ✅ Terminer l'intervention
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VUE 2 : HISTORIQUE (Avis clients) */}
          {activeTab === 'history' && (
            <div style={styles.list}>
              {history.length === 0 ? (
                <div style={styles.empty}>Aucun ticket terminé et noté pour l'instant.</div>
              ) : (
                history.map(item => (
                  <div key={item.id} style={styles.historyCard}>
                    <div style={styles.header}>
                      <span style={{fontWeight: 'bold', color: '#333'}}>{item.category}</span>
                      <span style={styles.date}>{new Date(item.validatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    [cite_start]{/* Affichage de la Note [cite: 31] */}
                    <div style={styles.ratingRow}>
                      Note reçue : <strong style={{color: '#d97706', fontSize: '18px'}}>{item.rating}/5 ⭐</strong>
                    </div>

                    {/* Affichage du Commentaire */}
                    {item.studentComment ? (
                      <div style={styles.commentBox}>
                        " {item.studentComment} "
                      </div>
                    ) : (
                      <p style={{fontStyle: 'italic', color: '#999', fontSize: '12px'}}>Aucun commentaire laissé.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  logoutLink: { background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' },
  
  // Styles des Onglets
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' },
  tab: { padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontWeight: 'bold' },
  activeTab: { padding: '10px 20px', border: 'none', background: '#e0f2fe', color: '#005596', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },

  empty: { textAlign: 'center', marginTop: '50px', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  
  // Card Standard
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  tag: { background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' },
  urgentBadge: { background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  locationRow: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
  desc: { color: '#4b5563', marginBottom: '15px', lineHeight: '1.5' },
  studentInfo: { fontSize: '12px', color: '#9ca3af', marginBottom: '15px' },
  btnFinish: { width: '100%', padding: '14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },

  // Card Historique (Feedback)
  historyCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  date: { fontSize: '12px', color: '#999' },
  ratingRow: { margin: '10px 0' },
  commentBox: { backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', fontStyle: 'italic', color: '#555' }
};