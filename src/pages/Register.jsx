import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// [NORME] On n'importe plus Firebase ici !
// On importe notre Service
import { registerUser } from "../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    prenom: "", nom: "", email: "", password: "",
    pavillon: "A", chambre: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // [NORME] Appel du Service (Propre et agnostique)
      await registerUser(formData);
      
      alert("Compte créé avec succès !");
      navigate('/app/student'); // Redirection directe

    } catch (err) {
      console.error(err);
      setError("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Inscription FixLiya</h1>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          
          <div style={styles.row}>
            <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} style={styles.input} required />
            <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} style={styles.input} required />
          </div>

          <input name="email" type="email" placeholder="Email école" value={formData.email} onChange={handleChange} style={styles.input} required />
          <input name="password" type="password" placeholder="Mot de passe (6+ carac.)" value={formData.password} onChange={handleChange} style={styles.input} required />

          <div style={styles.row}>
            <select name="batiment" value={formData.batiment} onChange={handleChange} style={styles.input}>
              <option value="A">batiment A</option>
              <option value="B">batiment B</option>
              <option value="C">batiment C</option>
              <option value="Filles">batiment Filles</option>
            </select>
            <input name="chambre" placeholder="N° Chambre" value={formData.chambre} onChange={handleChange} style={styles.input} required />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

// Styles CSS-in-JS (Pour garder le code propre)
const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '20px' },
  card: { width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' },
  title: { color: '#005596', marginBottom: '1.5rem', fontSize: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
  button: { padding: '14px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px' },
  footer: { marginTop: '1.5rem', fontSize: '14px', color: '#666' },
  link: { color: '#005596', fontWeight: 'bold', textDecoration: 'none' }
};