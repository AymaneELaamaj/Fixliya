import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createTicket } from '../services/ticketService';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // États
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  // On garde le state imageFile mais on ne l'utilise pas pour l'envoi
  const [imageFile, setImageFile] = useState(null);
  
  const [userData, setUserData] = useState(null);

  // Catégories (Sec 2.2) [cite: 22]
  const categories = ["Plomberie", "Électricité", "Ménage", "Menuiserie", "Autre"];

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return alert("Veuillez sélectionner une catégorie.");
    
    // MODIFICATION : J'ai commenté la vérification de l'image
    // if (!imageFile) return alert("La photo est obligatoire.");

    setLoading(true);
    try {
      const ticketData = {
        studentId: auth.currentUser.uid,
        // Sécurité : si userData n'est pas encore chargé, on met "Inconnu"
        studentName: userData ? `${userData.prenom} ${userData.nom}` : "Étudiant",
        location: userData ? `${userData.pavillon} - Chambre ${userData.chambre}` : "Non défini",
        category,
        description,
        isUrgent
      };

      // On n'envoie plus imageFile à la fonction
      await createTicket(ticketData);
      
      alert("Ticket créé avec succès !");
      navigate('/app/student'); 
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nouvel Incident</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Catégories */}
          <label style={styles.label}>Type de panne :</label>
          <div style={styles.grid}>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                style={category === cat ? styles.catButtonActive : styles.catButton}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Urgence [cite: 24] */}
          <div style={styles.urgentBox}>
            <input 
              type="checkbox" 
              checked={isUrgent} 
              onChange={(e) => setIsUrgent(e.target.checked)}
              id="urgent"
            />
            <label htmlFor="urgent" style={styles.urgentLabel}>
              URGENT (ex: Inondation, danger)
            </label>
          </div>

          {/* Description */}
          <textarea
            placeholder="Description du problème..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            required
          />

          {/* Photo (Désactivée) */}
          <label style={styles.label}>Photo (Désactivée temporairement) :</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files[0])}
            style={styles.input}
            // required retiré ici aussi
          />

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Envoi en cours..." : "Signaler le problème"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  title: { color: '#005596', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  catButton: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' },
  catButtonActive: { padding: '10px', border: '2px solid #005596', borderRadius: '8px', background: '#e6f0fa', color: '#005596', fontWeight: 'bold', cursor: 'pointer' },
  urgentBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', border: '1px solid #ef4444' },
  urgentLabel: { color: '#991b1b', fontWeight: 'bold', fontSize: '14px' },
  textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' },
  input: { padding: '10px' },
  submitBtn: { padding: '15px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
};