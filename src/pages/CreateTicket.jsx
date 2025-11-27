import React, { useState, useEffect, useRef } from 'react';
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
  const [ticketType, setTicketType] = useState("urgent"); // "urgent" ou "planifier"
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [locationType, setLocationType] = useState(""); // "batiment" ou "commun"
  const [building, setBuilding] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [commonAreaName, setCommonAreaName] = useState("");
  const [isAccountDisabled, setIsAccountDisabled] = useState(false); // Compte désactivé

  const [userData, setUserData] = useState(null);

  // Références pour la caméra et l'audio
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Catégories (Sec 2.2) [cite: 22]
  const categories = ["Plomberie", "Électricité", "Ménage", "Wifi", "Autre"];

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          // Vérifier si le compte est désactivé
          if (data.isActive === false) {
            setIsAccountDisabled(true);
          }
        }
      }
    };
    fetchUser();
  }, []);

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Erreur d'accès à la caméra: " + err.message);
    }
  };

  // Prendre une photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        setImageFile(blob);
        alert("Photo capturée avec succès!");
      });
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // Démarrer l'enregistrement audio
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioFile(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Erreur d'accès au microphone: " + err.message);
    }
  };

  // Arrêter l'enregistrement audio
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Créer une URL de lecture pour l'audio
  const getAudioURL = () => {
    if (audioFile) {
      return URL.createObjectURL(audioFile);
    }
    return null;
  };

  // Supprimer l'enregistrement audio
  const deleteAudioRecording = () => {
    setAudioFile(null);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return alert("Veuillez sélectionner une catégorie.");
    if (!locationType) return alert("Veuillez sélectionner le type de localisation.");
    if (locationType === "batiment" && (!building || !roomNumber)) {
      return alert("Veuillez remplir le bâtiment et le numéro de chambre.");
    }
    if (locationType === "commun" && !commonAreaName) {
      return alert("Veuillez renseigner le nom du local commun.");
    }
    if (ticketType === "planifier" && (!scheduledDate || !scheduledTime)) {
      return alert("Veuillez préciser la date et l'heure pour une intervention planifiée.");
    }

    setLoading(true);
    try {
      // Déterminer la localisation selon le type
      let location = "";
      if (locationType === "batiment") {
        location = `Bâtiment ${building} - Chambre ${roomNumber}`;
      } else {
        location = `Local commun: ${commonAreaName}`;
      }

      const ticketData = {
        studentId: auth.currentUser.uid,
        studentName: userData ? `${userData.prenom} ${userData.nom}` : "Étudiant",
        location: location,
        category,
        description,
        locationType: locationType,
        building: locationType === "batiment" ? building : null,
        roomNumber: locationType === "batiment" ? roomNumber : null,
        commonAreaName: locationType === "commun" ? commonAreaName : null,
        isUrgent: ticketType === "urgent",
        ticketType: ticketType,
        scheduledDate: ticketType === "planifier" ? scheduledDate : null,
        scheduledTime: ticketType === "planifier" ? scheduledTime : null,
        scheduledDateTime: ticketType === "planifier" ? `${scheduledDate} ${scheduledTime}` : null
      };

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
      {isAccountDisabled ? (
        <div style={styles.disabledCard}>
          <div style={styles.disabledIconLarge}>🔒</div>
          <h2 style={styles.disabledTitle}>Compte Désactivé</h2>
          <p style={styles.disabledMessage}>
            Votre compte a été désactivé par l'administrateur système.
          </p>
          <p style={styles.disabledDescription}>
            Vous n'avez pas accès à la création de nouveaux tickets. 
            Veuillez contacter l'administrateur pour plus d'informations.
          </p>
          <button 
            onClick={() => window.history.back()} 
            style={styles.backBtn}
          >
            ← Retour
          </button>
        </div>
      ) : (
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

          {/* Localisation */}
          <label style={styles.label}>📍 Localisation :</label>
          <div style={styles.locationGrid}>
            <button
              type="button"
              onClick={() => {
                setLocationType("batiment");
                setCommonAreaName("");
              }}
              style={locationType === "batiment" ? styles.locationButtonActive : styles.locationButton}
            >
              🏢 Bâtiment/Chambre
            </button>
            <button
              type="button"
              onClick={() => {
                setLocationType("commun");
                setBuilding("");
                setRoomNumber("");
              }}
              style={locationType === "commun" ? styles.locationButtonActive : styles.locationButton}
            >
              🏛️ Local Commun
            </button>
          </div>

          {/* Champs pour Bâtiment */}
          {locationType === "batiment" && (
            <div style={styles.locationSection}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.smallLabel}>Bâtiment :</label>
                  <select 
                    value={building} 
                    onChange={(e) => setBuilding(e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.smallLabel}>Numéro Chambre :</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 101, 205..." 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={styles.selectInput}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Champs pour Local Commun */}
          {locationType === "commun" && (
            <div style={styles.locationSection}>
              <label style={styles.smallLabel}>Nom du Local Commun :</label>
              <input 
                type="text" 
                placeholder="Ex: Salle de réunion, Cuisine, Bibliothèque..." 
                value={commonAreaName} 
                onChange={(e) => setCommonAreaName(e.target.value)}
                style={styles.selectInput}
                required
              />
            </div>
          )}

          {/* Urgence ou Planification */}
          <label style={styles.label}>⏰ Type d'intervention :</label>
          <div style={styles.typeGrid}>
            <button
              type="button"
              onClick={() => setTicketType("urgent")}
              style={ticketType === "urgent" ? styles.typeButtonActive : styles.typeButton}
            >
              🚨 Urgent
            </button>
            <button
              type="button"
              onClick={() => setTicketType("planifier")}
              style={ticketType === "planifier" ? styles.typeButtonActive : styles.typeButton}
            >
              📅 Planifier
            </button>
          </div>

          {/* Champs de planification (visibles si "Planifier" est sélectionné) */}
          {ticketType === "planifier" && (
            <div style={styles.schedulingSection}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.smallLabel}>Date :</label>
                  <input 
                    type="date" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={styles.select}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.smallLabel}>Heure :</label>
                  <input 
                    type="time" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={styles.select}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <textarea
            placeholder="Description du problème..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            required
          />

          {/* Section Caméra en temps réel */}
          <div style={styles.mediaSection}>
            <h3 style={styles.mediaTitle}>📷 Photo en temps réel</h3>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              style={styles.video}
            />
            <canvas 
              ref={canvasRef} 
              width={640}
              height={480}
              style={{display: 'none'}}
            />
            <div style={styles.mediaButtons}>
              <button type="button" onClick={startCamera} style={styles.mediaBtn}>Démarrer Caméra</button>
              <button type="button" onClick={capturePhoto} style={styles.mediaBtn}>📸 Prendre Photo</button>
              <button type="button" onClick={stopCamera} style={styles.mediaBtn}>Arrêter Caméra</button>
            </div>
            {imageFile && <p style={styles.successText}>✓ Photo capturée</p>}
          </div>

          {/* Section Audio */}
          <div style={styles.mediaSection}>
            <h3 style={styles.mediaTitle}>🎙️ Enregistrement vocal</h3>
            
            {!audioFile ? (
              <>
                <div style={styles.mediaButtons}>
                  {!isRecording ? (
                    <button type="button" onClick={startAudioRecording} style={styles.mediaBtn}>
                      🎤 Commencer l'enregistrement
                    </button>
                  ) : (
                    <button type="button" onClick={stopAudioRecording} style={{...styles.mediaBtn, backgroundColor: '#ef4444'}}>
                      ⏹️ Arrêter l'enregistrement
                    </button>
                  )}
                </div>
                {isRecording && <p style={{...styles.successText, color: '#ef4444'}}>🔴 Enregistrement en cours...</p>}
              </>
            ) : (
              <>
                <div style={styles.audioPlayer}>
                  <audio 
                    src={getAudioURL()} 
                    controls 
                    style={styles.audioControls}
                  />
                </div>
                <div style={styles.mediaButtons}>
                  <button type="button" onClick={deleteAudioRecording} style={{...styles.mediaBtn, backgroundColor: '#ef4444'}}>
                    🗑️ Supprimer
                  </button>
                  <button type="button" onClick={startAudioRecording} style={{...styles.mediaBtn, backgroundColor: '#f59e0b'}}>
                    🔄 Enregistrer de nouveau
                  </button>
                </div>
                <p style={styles.successText}>✓ Audio prêt à être envoyé</p>
              </>
            )}
          </div>

          {/* Photo (Fichier) - Optionnel */}
          <label style={styles.label}>📁 Ou télécharger une image :</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files[0])}
            style={styles.input}
          />

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Envoi en cours..." : "Signaler le problème"}
          </button>
        </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  disabledCard: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  disabledIconLarge: { fontSize: '60px', marginBottom: '20px' },
  disabledTitle: { fontSize: '24px', color: '#dc2626', fontWeight: 'bold', margin: '0 0 15px 0' },
  disabledMessage: { fontSize: '16px', color: '#991b1b', fontWeight: '600', margin: '0 0 10px 0' },
  disabledDescription: { fontSize: '14px', color: '#7f1d1d', margin: '0 0 25px 0', lineHeight: '1.6' },
  backBtn: { backgroundColor: '#6b7280', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' },
  title: { color: '#005596', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  smallLabel: { fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '5px', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  locationGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  catButton: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' },
  catButtonActive: { padding: '10px', border: '2px solid #005596', borderRadius: '8px', background: '#e6f0fa', color: '#005596', fontWeight: 'bold', cursor: 'pointer' },
  locationButton: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  locationButtonActive: { padding: '12px', border: '2px solid #10b981', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  typeButton: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  typeButtonActive: { padding: '12px', border: '2px solid #ef4444', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  schedulingSection: { backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  locationSection: { backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  row: { display: 'flex', gap: '10px' },
  inputGroup: { flex: 1 },
  select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', backgroundColor: 'white' },
  selectInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' },
  urgentBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', border: '1px solid #ef4444' },
  urgentLabel: { color: '#991b1b', fontWeight: 'bold', fontSize: '14px' },
  textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' },
  input: { padding: '10px' },
  mediaSection: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  mediaTitle: { margin: '0 0 10px 0', color: '#005596', fontSize: '16px', fontWeight: 'bold' },
  video: { width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#000' },
  audioPlayer: { backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px' },
  audioControls: { width: '100%', height: '32px' },
  mediaButtons: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  mediaBtn: { padding: '10px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', flex: '1', minWidth: '100px' },
  successText: { color: '#16a34a', fontWeight: 'bold', fontSize: '13px', margin: '5px 0 0 0' },
  submitBtn: { padding: '15px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
};