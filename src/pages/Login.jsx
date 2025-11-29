import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// [IMPORTANT] Ajoute getUserProfile dans l'import ci-dessous
import { loginUser, getUserProfile } from "../services/authService"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // 1. Connexion Auth (Firebase Auth)
      const userAuth = await loginUser(email, password);
      
      // 2. Récupération du rôle dans Firestore
      // On utilise l'UID récupéré à l'étape 1
      const userProfile = await getUserProfile(userAuth.uid);

      // 3. Redirection conditionnelle selon le rôle
      if (userProfile.role === 'admin') {
          navigate('/app/admin'); // Crée cette route si elle n'existe pas
      } else if (userProfile.role === 'artisan') {
          navigate('/app/artisan');
      } else {
          // Par défaut (student)
          navigate('/app/student'); 
      }

    } catch (err) {
      console.error(err);
      // Message d'erreur un peu plus précis si le profil n'existe pas
      setError("Erreur : Identifiants incorrects ou compte introuvable.");
    }
  };

  // ... le reste de ton JSX (return) reste identique ...
  return (
    <div style={styles.container}>
       {/* ... ton code JSX ... */}
       <div style={styles.card}>
        <h1 style={styles.title}>FixLiya</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin} style={styles.form}>
           {/* ... tes inputs ... */}
           <input 
            type="email" 
            placeholder="Email" // J'ai enlevé "étudiant" car ça peut être un admin
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input} 
            required
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input} 
            required
          />
          <button type="submit" style={styles.button}>Se connecter</button>
        </form>
        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>
            S'inscrire
          </Link>
        </p>
       </div>
    </div>
  );
}

// ... styles ...
const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' },
  card: { width: '90%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' },
  title: { color: '#005596', marginBottom: '1.5rem', fontSize: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
  button: { padding: '14px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  footer: { marginTop: '1.5rem', fontSize: '14px', color: '#666' },
  link: { color: '#005596', fontWeight: 'bold', textDecoration: 'none' }
};