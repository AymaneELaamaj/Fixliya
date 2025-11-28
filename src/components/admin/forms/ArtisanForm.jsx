import React, { useState } from 'react';
import styles from '../styles/AdminDashboard.module.css';

const INITIAL_STATE = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  specialite: '',
  password: ''
};

export default function ArtisanForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.prenom || !formData.nom || !formData.email || !formData.specialite || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData(INITIAL_STATE);
    } catch (err) {
      alert('Erreur lors de la création: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>✨ Ajouter un Nouveau Artisan</h2>

      <div className={styles.formGrid}>
        <input
          type="text"
          placeholder="Prénom *"
          value={formData.prenom}
          onChange={(e) => handleChange('prenom', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
        <input
          type="text"
          placeholder="Nom *"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
        <input
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={(e) => handleChange('telephone', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
        <input
          type="text"
          placeholder="Spécialité *"
          value={formData.specialite}
          onChange={(e) => handleChange('specialite', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
        <input
          type="password"
          placeholder="Mot de passe *"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleSubmit}
          className={`${styles.btn} ${styles.btnSuccess}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Création...' : '✓ Créer Artisan'}
        </button>
        <button
          onClick={onCancel}
          className={`${styles.btn} ${styles.btnSecondary}`}
          disabled={isSubmitting}
        >
          ✕ Annuler
        </button>
      </div>
    </div>
  );
}