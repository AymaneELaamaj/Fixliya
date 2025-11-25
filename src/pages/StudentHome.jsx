// src/pages/StudentHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext"; 
import { getStudentTickets } from "../services/ticketService"; // Notre Service
import { logoutUser } from "../services/authService"; // Notre Service

export default function StudentHome() {
  const { currentUser } = useAuth(); 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Chargement des données
  useEffect(() => {
    async function load() {
      if (currentUser) {
        const data = await getStudentTickets(currentUser.uid);
        setTickets(data);
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes Signalements</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </div>

      <div style={styles.content}>
        {loading ? <p>Chargement...</p> : null}
        
        {!loading && tickets.length === 0 && (
          <p style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Aucune panne signalée. 🎉</p>
        )}

        <div style={styles.list}>
          {tickets.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                 <span style={styles.badge}>{t.category}</span>
                 <span style={{fontSize:'12px', color:'#666'}}>{t.status}</span>
              </div>
              <h3 style={{margin: '5px 0'}}>{t.titre}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Le Bouton Flottant (+) qui emmène vers la création */}
      <button onClick={() => navigate('/create-ticket')} style={styles.fab}>+</button>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' },
  header: { padding: '20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  title: { margin: 0, fontSize: '18px', color: '#005596' },
  logoutBtn: { background: '#ffebee', color: '#c62828', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  content: { padding: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  badge: { background: '#e1f5fe', color: '#0277bd', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' },
  fab: { position: 'fixed', bottom: '20px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: '#005596', color: 'white', fontSize: '30px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer' }
};