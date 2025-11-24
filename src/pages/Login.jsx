// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Connexion RÉUSSIE !");
      // navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      setError("Erreur : " + err.message);
    }
  };

  return (
    // CONTENEUR PRINCIPAL (Le fond gris)
    // 100vh = 100% de la hauteur de l'écran
    // display: flex + center = Centre le contenu verticalement et horizontalement
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>

      {/* LA CARTE (Le rectangle blanc) */}
      <div style={{ 
        width: '90%',        // Mobile : Prend presque toute la largeur
        maxWidth: '400px',   // Web : S'arrête à 400px max (ne s'étire pas)
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '12px', // Coins arrondis style App
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Ombre douce
        textAlign: 'center'
      }}>
        
        {/* LOGO / TITRE */}
        <h1 style={{ color: '#005596', margin: '0 0 1.5rem 0', fontSize: '24px' }}>
          FixLiya
        </h1>
        
        {error && <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          padding: '10px', 
          borderRadius: '6px', 
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input 
            type="email" 
            placeholder="Email étudiant" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              fontSize: '16px' // Taille confortable pour le tactile
            }} 
            required
          />
          
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              fontSize: '16px'
            }} 
            required
          />
          
          <button type="submit" style={{ 
            padding: '14px', 
            backgroundColor: '#005596', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px', 
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            Se connecter
          </button>

        </form>

        <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '14px' }}>
          Pas encore de compte ? <span style={{ color: '#005596', cursor: 'pointer', fontWeight: 'bold' }}>S'inscrire</span>
        </p>
      </div>
    </div>
  );
}