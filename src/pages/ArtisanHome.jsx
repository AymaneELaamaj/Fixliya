import React, { useState, useEffect } from 'react';
import { getMyMissions, completeMission } from "../services/artisanService";
import { auth } from "../firebase"; // On utilise auth direct pour simplifier
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function ArtisanHome() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Chargement des données
  useEffect(() => {
    // On vérifie que l'auth est prête
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadMissions(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadMissions = async (uid) => {
    try {
      const data = await getMyMissions(uid);
      setMissions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // [IMPORTANT] On arrête le chargement ici
    }
  };

  const handleFinish = async (id) => {
    if (window.confirm("Confirmer la fin de l'intervention ?")) {
      await completeMission(id);
      // On recharge la liste pour faire disparaître le ticket terminé
      if (auth.currentUser) loadMissions(auth.currentUser.uid);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h1 style={{color: '#005596', margin: 0}}>Ma Journée 🛠️</h1>
        <button onClick={handleLogout} style={styles.logoutLink}>Déconnexion</button>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', marginTop: '20px'}}>Chargement...</p>
      ) : missions.length === 0 ? (
        <div style={styles.empty}>
          <h2>Aucune mission en cours !</h2>
          <p>Vous êtes à jour. Prenez une pause ☕</p>
        </div>
      ) : (
        <div style={styles.list}>
          {missions.map(mission => (
            <div key={mission.id} style={styles.card}>
              
              {/* En-tête de la carte : Lieu et Catégorie [cite: 53] */}
              <div style={styles.header}>
                <span style={styles.tag}>{mission.category}</span>
                {mission.isUrgent && <span style={styles.urgentBadge}>URGENT</span>}
              </div>

              {/* Détails Mission [cite: 53] */}
              <div style={styles.locationRow}>
                 📍 {mission.location || "Lieu non précisé"}
              </div>

              <p style={styles.desc}>{mission.description}</p>
              
              <div style={styles.studentInfo}>
                👤 Étudiant : {mission.studentName}
              </div>

              {/* Action Clôture [cite: 56] */}
              <button 
                onClick={() => handleFinish(mission.id)} 
                style={styles.btnFinish}
              >
                ✅ Terminer l'intervention
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  logoutLink: { background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' },
  empty: { textAlign: 'center', marginTop: '50px', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  tag: { background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' },
  urgentBadge: { background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  locationRow: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
  desc: { color: '#4b5563', marginBottom: '15px', lineHeight: '1.5' },
  studentInfo: { fontSize: '12px', color: '#9ca3af', marginBottom: '15px' },
  btnFinish: { width: '100%', padding: '14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};