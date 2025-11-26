import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtisanAccount } from '../services/adminService';

export default function CreateArtisan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    specialite: "Plomberie" // Valeur par défaut
  });

  // Liste des spécialités basées sur les catégories de pannes (Sec 2.2) [cite: 22]
  const specialites = ["Plomberie", "Électricité", "Ménage", "Menuiserie", "Autre"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel de la fonction "App Fantôme" qui ne déconnecte PAS l'admin
      await createArtisanAccount(formData);
      
      alert(`L'artisan ${formData.prenom} a été créé avec succès !`);
      navigate('/app/admin'); // Retour au tableau de bord
    } catch (err) {
      console.error(err);
      setError("Erreur : Impossible de créer le compte (Email déjà pris ?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Ajouter un Artisan</h2>
        <p style={styles.subtitle}>Créez un compte pour un technicien interne.</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input 
              name="prenom" 
              placeholder="Prénom" 
              onChange={handleChange} 
              style={styles.input} 
              required 
            />
            <input 
              name="nom" 
              placeholder="Nom" 
              onChange={handleChange} 
              style={styles.input} 
              required 
            />
          </div>

          <input 
            type="email" 
            name="email" 
            placeholder="Email professionnel" 
            onChange={handleChange} 
            style={styles.input} 
            required 
          />

          <input 
            type="password" 
            name="password" 
            placeholder="Mot de passe provisoire" 
            onChange={handleChange} 
            style={styles.input} 
            required 
            minLength="6"
          />

          <label style={styles.label}>Spécialité :</label>
          <select 
            name="specialite" 
            onChange={handleChange} 
            style={styles.select}
            value={formData.specialite}
          >
            {specialites.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Création en cours..." : "Créer le compte Artisan"}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/app/admin')} 
            style={styles.cancelBtn}
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  card: { width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  title: { color: '#0f172a', marginBottom: '0.5rem', fontSize: '24px', textAlign: 'center' },
  subtitle: { color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', flex: 1 },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '-5px' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' },
  submitBtn: { padding: '14px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  cancelBtn: { padding: '10px', backgroundColor: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: '500' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px' }
};