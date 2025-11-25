import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { getMyMissions, completeMission } from "../services/artisanService";
import { useNavigate } from 'react-router-dom';

export default function ArtisanHome() {
  const { currentUser } = useAuth(); // On a besoin de savoir QUI est connecté
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simulation : Pour le MVP, on va dire que le nom de l'artisan 
  // est stocké dans son profil. Pour l'instant, on va utiliser une astuce de test.
  // ASTUCE TEST : On considère que votre nom (ex: "Aymane") est le nom de l'artisan.
  const artisanName = "Ahmed Plombier"; // <--- TEST : On force ce nom pour voir si ça marche

  useEffect(() => {
    loadMissions();
  }, []);

  // Dans ArtisanHome.jsx

const loadMissions = async () => {
  if (currentUser) {
     const data = await getMyMissions(currentUser.uid); 
     setMissions(data);
  }
};

  const handleFinish = async (id) => {
    if (window.confirm("Avez-vous terminé cette réparation ?")) {
      await completeMission(id);
      loadMissions(); // On rafraîchit la liste : la mission doit disparaître
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{color: '#005596'}}>Ma Journée 🛠️</h1>
      <p style={{color: '#666'}}>Technicien : {artisanName}</p>

      {loading && <p>Chargement des missions...</p>}

      {!loading && missions.length === 0 && (
        <div style={styles.empty}>
          <h2>Aucune mission !</h2>
          <p>Prenez une pause café ☕</p>
        </div>
      )}

      <div style={styles.list}>
        {missions.map(mission => (
          <div key={mission.id} style={styles.card}>
            
            <div style={styles.header}>
              <span style={styles.tag}>{mission.category}</span>
              <span style={styles.room}>Chambre ?</span> 
              {/* On ajoutera la vraie chambre plus tard via le profil étudiant */}
            </div>

            <h3>{mission.titre}</h3>
            <p style={{color: '#555'}}>{mission.description}</p>

            <button 
              onClick={() => handleFinish(mission.id)} 
              style={styles.btnFinish}
            >
              ✅ Marquer comme Terminé
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' },
  empty: { textAlign: 'center', marginTop: '50px', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  tag: { background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  room: { fontWeight: 'bold', color: '#333' },
  btnFinish: { width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};