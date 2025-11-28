import React, { useState } from 'react';
import ArtisanCard from '../cards/ArtisanCard';
import ArtisanForm from '../forms/ArtisanForm';
import styles from '../styles/AdminDashboard.module.css';

export default function ArtisansTab({ artisans, onUpdate, onDelete, onCreate }) {
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (formData) => {
    await onCreate(formData);
    setShowForm(false);
    alert('Artisan créé avec succès !');
  };

  const handleUpdate = async (artisanId, formData) => {
    await onUpdate(artisanId, formData);
    alert('Artisan modifié avec succès !');
  };

  const handleDelete = async (artisanId) => {
    try {
      await onDelete(artisanId);
      alert('Artisan supprimé avec succès !');
    } catch (err) {
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  return (
    <div className={styles.section}>
      {/* Header avec bouton d'ajout */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`${styles.btn} ${showForm ? styles.btnSecondary : styles.btnPrimary}`}
        >
          {showForm ? '✕ Annuler' : '+ Ajouter Artisan'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <ArtisanForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Grille des artisans */}
      {artisans.length === 0 ? (
        <div className={styles.emptyState}>
          <p>📭 Aucun artisan trouvé. Cliquez sur "Ajouter Artisan" pour commencer.</p>
        </div>
      ) : (
        <div className={styles.artisansGrid}>
          {artisans.map(artisan => (
            <ArtisanCard
              key={artisan.id}
              artisan={artisan}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}