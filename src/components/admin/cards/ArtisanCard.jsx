import React, { useState } from 'react';
import styles from '../styles/AdminDashboard.module.css';

export default function ArtisanCard({ artisan, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prenom: artisan.prenom,
    nom: artisan.nom,
    email: artisan.email,
    telephone: artisan.telephone || '',
    specialite: artisan.specialite
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(artisan.id, formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur modification artisan:', err);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${artisan.prenom} ?`)) {
      onDelete(artisan.id);
    }
  };

  if (isEditing) {
    return (
      <div className={styles.card}>
        <h3 className={styles.formTitle}>Modifier Artisan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={styles.input}
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Spécialité"
            value={formData.specialite}
            onChange={(e) => handleChange('specialite', e.target.value)}
            className={styles.input}
          />
          <div className={styles.buttonGroup}>
            <button onClick={handleSave} className={`${styles.btn} ${styles.btnSuccess}`}>
              ✓ Enregistrer
            </button>
            <button onClick={() => setIsEditing(false)} className={`${styles.btn} ${styles.btnSecondary}`}>
              ✕ Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '12px', right: '15px', fontSize: '32px' }}>
        👨‍🔧
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
          {artisan.prenom} {artisan.nom}
        </h3>
        <p style={{ margin: '6px 0', fontSize: '13px', color: '#64748b' }}>
          <strong>Email:</strong> {artisan.email}
        </p>
        <p style={{ margin: '6px 0', fontSize: '13px', color: '#64748b' }}>
          <strong>Tel:</strong> {artisan.telephone || 'N/A'}
        </p>
        <p style={{ margin: '6px 0', fontSize: '13px', color: '#64748b' }}>
          <strong>Spécialité:</strong>{' '}
          <span className={styles.badgeCategory}>{artisan.specialite}</span>
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => setIsEditing(true)} className={`${styles.btn} ${styles.btnEdit}`}>
          ✏️ Modifier
        </button>
        <button onClick={handleDelete} className={`${styles.btn} ${styles.btnDanger}`}>
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}