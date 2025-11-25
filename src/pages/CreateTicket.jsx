// src/pages/CreateTicket.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { createTicket } from "../services/ticketService"; // Appel du service

export default function CreateTicket() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [titre, setTitre] = useState("");
  const [category, setCategory] = useState("Plomberie");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // Pour stocker le fichier photo
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // On prépare les données
      const ticketData = {
        titre,
        category,
        description,
        studentId: currentUser.uid,
        studentEmail: currentUser.email // Utile pour l'admin
      };

      // On envoie tout au service (Données + Fichier Image)
      await createTicket(ticketData, image);

      alert("Ticket envoyé !");
      navigate('/app/student'); // Retour à la liste

    } catch (error) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: '#005596'}}>Nouveau Signalement</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Titre */}
        <label>Titre de la panne</label>
        <input 
          type="text" 
          placeholder="Ex: Fuite lavabo" 
          value={titre} 
          onChange={(e) => setTitre(e.target.value)} 
          style={styles.input} 
          required 
        />

        {/* Catégorie */}
        <label>Catégorie</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
          <option>Plomberie</option>
          <option>Électricité</option>
          <option>Menuiserie</option>
          <option>Internet</option>
          <option>Autre</option>
        </select>

        {/* Description */}
        <label>Description</label>
        <textarea 
          rows="4" 
          placeholder="Détails du problème..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={styles.input}
        />

        {/* Photo (Input File) */}
        <label>Preuve (Photo)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImage(e.target.files[0])} 
          style={{marginBottom: '20px'}}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Envoi en cours..." : "Envoyer le ticket"}
        </button>

        <button type="button" onClick={() => navigate(-1)} style={styles.cancel}>
          Annuler
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: 'auto', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' },
  button: { padding: '15px', background: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  cancel: { padding: '10px', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer' }
};