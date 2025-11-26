import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      await registerUser(formData);
      alert("Compte créé avec succès !");
      // Redirection vers le Login pour la "Connexion Unique" [cite: 19]
      navigate('/login'); 
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'inscription. Vérifiez les champs.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Inscription Étudiant</h1>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.row}>
            <input name="prenom" placeholder="Prénom" onChange={handleChange} style={styles.input} required />
            <input name="nom" placeholder="Nom" onChange={handleChange} style={styles.input} required />
          </div>

          <input type="email" name="email" placeholder="Email étudiant" onChange={handleChange} style={styles.input} required />
          
          <input type="tel" name="telephone" placeholder="Téléphone" onChange={handleChange} style={styles.input} required />

          <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} style={styles.input} required />
          <input type="password" name="confirmPassword" placeholder="Confirmer mot de passe" onChange={handleChange} style={styles.input} required />

          <button type="submit" style={styles.button}>S'inscrire</button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' },
  card: { width: '90%', maxWidth: '450px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' },
  title: { color: '#005596', marginBottom: '1.5rem', fontSize: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '10px' }, // Pour mettre Nom/Prénom côte à côte
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', flex: 1 },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', flex: 1, backgroundColor: 'white' },
  button: { padding: '14px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px' },
  footer: { marginTop: '1.5rem', fontSize: '14px', color: '#666' },
  link: { color: '#005596', fontWeight: 'bold', textDecoration: 'none' }
};