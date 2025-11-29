// Fichier : src/components/admin/BuildingView.jsx
import React from 'react';

const styles = {
  // Le conteneur de l'immeuble
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px', // Augmenté pour mobile
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '3px solid',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minWidth: '200px',
    width: '100%', // Pleine largeur sur mobile
    boxSizing: 'border-box'
  },
  
  // Le Toit
  roof: {
    width: 0,
    height: 0,
    borderLeft: '60px solid transparent',
    borderRight: '60px solid transparent',
    borderBottom: '40px solid #334155', // Gris foncé
    marginBottom: '-1px'
  },

  // Le Corps du bâtiment
  body: {
    backgroundColor: '#f8fafc',
    border: '2px solid #334155',
    borderBottom: 'none',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column-reverse', // RDC en bas
    gap: '6px'
  },

  // Un Étage
  floor: { display: 'flex', gap: '6px', justifyContent: 'center' },

  // Une Fenêtre (Appartement)
  window: {
    width: '30px',
    height: '30px',
    backgroundColor: '#cbd5e1', // Gris vitre éteinte
    borderRadius: '4px',
    border: '1px solid #94a3b8'
  },
  
  // Vitre allumée (si incident)
  windowAlert: { backgroundColor: '#fca5a5', border: '1px solid #ef4444' },

  // Le Sol
  ground: { width: '100%', height: '6px', backgroundColor: '#64748b', borderRadius: '4px' },

  // Textes
  title: { fontWeight: 'bold', marginTop: '10px', color: '#1e293b' },
  status: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }
};

// Ce composant reçoit des "props" (données) du parent
export default function BuildingView({ name, incidents }) {
  
  // Logique : Si incidents > 0 alors ROUGE (alert), sinon VERT (safe)
  const isAlert = incidents > 0;
  const statusColor = isAlert ? '#ef4444' : '#10b981'; // Rouge ou Vert

  return (
    <div 
      style={{...styles.container, borderColor: statusColor, boxShadow: isAlert ? '0 10px 15px -3px rgba(239, 68, 68, 0.2)' : 'none'}}
    >
      {/* 1. Le Toit */}
      <div style={styles.roof}></div>

      {/* 2. Le Bâtiment (Dessin CSS simple) */}
      <div style={styles.body}>
        {/* On dessine 3 étages fixes pour l'exemple */}
        {[1, 2, 3].map((floor) => (
          <div key={floor} style={styles.floor}>
            <div style={{...styles.window, ...(isAlert ? styles.windowAlert : {})}}></div>
            <div style={styles.window}></div>
          </div>
        ))}
        {/* Porte RDC */}
        <div style={{width:'20px', height:'25px', background:'#475569', margin:'0 auto', borderRadius:'2px 2px 0 0'}}></div>
      </div>

      {/* 3. Le Sol */}
      <div style={styles.ground}></div>

      {/* 4. Les Infos */}
      <div style={styles.title}>{name}</div>
      <div style={{...styles.status, color: statusColor}}>
        {isAlert ? `⚠️ ${incidents} PROBLÈMES` : '✅ SÉCURISÉ'}
      </div>
    </div>
  );
}