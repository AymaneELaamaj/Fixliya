import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createTicket } from '../services/ticketService';
import { LOCAL_TYPES } from '../services/localService';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // États
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ticketType, setTicketType] = useState("urgent"); // "urgent" ou "planifier"
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [photos, setPhotos] = useState([]); // Array de photos (max 3)
  const [isCameraActive, setIsCameraActive] = useState(false); // État de la caméra
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [locationType, setLocationType] = useState(""); // "building" ou "common_area" ou "other"
  const [selectedLocal, setSelectedLocal] = useState(null); // Local sélectionné
  const [roomNumber, setRoomNumber] = useState(""); // Pour les bâtiments
  const [otherLocation, setOtherLocation] = useState(""); // Pour "Autre"
  const [buildings, setBuildings] = useState([]); // Bâtiments
  const [commonAreas, setCommonAreas] = useState([]); // Espaces communs
  const [isAccountDisabled, setIsAccountDisabled] = useState(false); // Compte désactivé

  const [userData, setUserData] = useState(null);

  // Références pour la caméra et l'audio
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null); // Pour garder une référence au stream de la caméra

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

  // Charger les locaux disponibles
  useEffect(() => {
    const fetchLocals = async () => {
      try {
        const { getAllLocals } = await import('../services/localService');
        const locals = await getAllLocals();
        
        // Séparer bâtiments et espaces communs
        const buildingsList = locals.filter(local => local.type === LOCAL_TYPES.BUILDING && local.isActive);
        const commonAreasList = locals.filter(local => local.type === LOCAL_TYPES.COMMON_AREA && local.isActive);
        
        setBuildings(buildingsList);
        setCommonAreas(commonAreasList);
      } catch (error) {
        console.error("Erreur chargement locaux:", error);
      }
    };
    fetchLocals();
  }, []);

  // Nettoyer les URLs de prévisualisation à la fin
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  // Démarrer la caméra
  const startCamera = async () => {
    if (photos.length >= 3) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Forcer la lecture de la vidéo
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.log("Lecture automatique:", playError);
        }
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Erreur caméra:", err);
    }
  };

  // Prendre une photo
  const capturePhoto = () => {
    if (photos.length >= 3) {
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        const previewUrl = URL.createObjectURL(blob);
        const newPhoto = {
          file: blob,
          preview: previewUrl,
          source: 'camera'
        };
        setPhotos([...photos, newPhoto]);
        // Arrêter la caméra après la capture
        stopCamera();
      });
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Supprimer une photo
  const deletePhoto = (index) => {
    const photoToDelete = photos[index];
    if (photoToDelete.preview) {
      URL.revokeObjectURL(photoToDelete.preview);
    }
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // Ajouter des photos depuis fichier
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - photos.length;

    if (files.length > remainingSlots) {
      return;
    }

    const newPhotos = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      source: 'upload'
    }));

    setPhotos([...photos, ...newPhotos]);
    // Réinitialiser l'input
    e.target.value = '';
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
      console.error('Erreur microphone:', err);
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
    if (!category) return;
    if (!locationType) return;
    
    // Validation selon le type de local
    if (locationType === "building" && (!selectedLocal || !roomNumber)) {
      return;
    }
    if (locationType === "common_area" && !selectedLocal) {
      return;
    }
    if (locationType === "other" && !otherLocation.trim()) {
      return;
    }
    
    if (ticketType === "planifier" && (!scheduledDate || !scheduledTime)) {
      return;
    }

    setLoading(true);
    try {
      // Déterminer la localisation selon le type
      let location = "";
      let localId = null;
      let localName = null;
      
      if (locationType === "building" && selectedLocal) {
        location = `${selectedLocal.name} - Chambre ${roomNumber}`;
        localId = selectedLocal.id;
        localName = selectedLocal.name;
      } else if (locationType === "common_area" && selectedLocal) {
        location = selectedLocal.name;
        localId = selectedLocal.id;
        localName = selectedLocal.name;
      } else if (locationType === "other") {
        location = otherLocation.trim();
      }

      // Upload des photos si présentes
      let imageUrls = [];
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const imageRef = ref(storage, `tickets/${auth.currentUser.uid}/${Date.now()}_photo_${i}.jpg`);
          await uploadBytes(imageRef, photo.file);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }
      }

      // Upload de l'audio si présent
      let audioUrl = null;
      if (audioFile) {
        const audioRef = ref(storage, `tickets/${auth.currentUser.uid}/${Date.now()}_audio.mp3`);
        await uploadBytes(audioRef, audioFile);
        audioUrl = await getDownloadURL(audioRef);
      }

      const ticketData = {
        studentId: auth.currentUser.uid,
        studentName: userData ? `${userData.prenom} ${userData.nom}` : "Étudiant",
        location: location,
        localId: localId, // ID du local (null si "autre")
        localName: localName, // Nom du local (null si "autre")
        category,
        description,
        locationType: locationType,
        roomNumber: locationType === "building" ? roomNumber : null,
        isUrgent: ticketType === "urgent",
        ticketType: ticketType,
        scheduledDate: ticketType === "planifier" ? scheduledDate : null,
        scheduledTime: ticketType === "planifier" ? scheduledTime : null,
        scheduledDateTime: ticketType === "planifier" ? `${scheduledDate} ${scheduledTime}` : null,
        imageUrls: imageUrls, // Array d'URLs
        audioUrl: audioUrl
      };

      await createTicket(ticketData);

      navigate('/app/student');
    } catch (err) {
      console.error('Erreur création ticket:', err);
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
                setLocationType("building");
                setSelectedLocal(null);
                setOtherLocation("");
              }}
              style={locationType === "building" ? styles.locationButtonActive : styles.locationButton}
            >
              🏢 Bâtiment
            </button>
            <button
              type="button"
              onClick={() => {
                setLocationType("common_area");
                setSelectedLocal(null);
                setRoomNumber("");
                setOtherLocation("");
              }}
              style={locationType === "common_area" ? styles.locationButtonActive : styles.locationButton}
            >
              🏛️ Espace Commun
            </button>
            <button
              type="button"
              onClick={() => {
                setLocationType("other");
                setSelectedLocal(null);
                setRoomNumber("");
              }}
              style={locationType === "other" ? styles.locationButtonActive : styles.locationButton}
            >
              📝 Autre
            </button>
          </div>

          {/* Champs pour Bâtiment */}
          {locationType === "building" && (
            <div style={styles.locationSection}>
              <div style={styles.inputGroup}>
                <label style={styles.smallLabel}>Sélectionner le Bâtiment :</label>
                <select 
                  value={selectedLocal?.id || ""} 
                  onChange={(e) => {
                    const local = buildings.find(b => b.id === e.target.value);
                    setSelectedLocal(local || null);
                  }}
                  style={styles.select}
                  required
                >
                  <option value="">-- Choisir un bâtiment --</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name} ({building.totalRooms} chambres)
                    </option>
                  ))}
                </select>
              </div>
              {selectedLocal && (
                <div style={styles.inputGroup}>
                  <label style={styles.smallLabel}>Numéro de Chambre :</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 101, 205..." 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={styles.selectInput}
                    required
                  />
                  <small style={styles.helpText}>
                    Chambres disponibles: 1 à {selectedLocal.totalRooms}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Champs pour Espace Commun */}
          {locationType === "common_area" && (
            <div style={styles.locationSection}>
              <label style={styles.smallLabel}>Sélectionner l'Espace Commun :</label>
              <select 
                value={selectedLocal?.id || ""} 
                onChange={(e) => {
                  const local = commonAreas.find(c => c.id === e.target.value);
                  setSelectedLocal(local || null);
                }}
                style={styles.select}
                required
              >
                <option value="">-- Choisir un espace --</option>
                {commonAreas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name} {area.category && `(${area.category})`}
                  </option>
                ))}
              </select>
              {commonAreas.length === 0 && (
                <p style={styles.noDataText}>
                  ℹ️ Aucun espace commun disponible. Utilisez "Autre" pour décrire la localisation.
                </p>
              )}
            </div>
          )}

          {/* Champs pour Autre localisation */}
          {locationType === "other" && (
            <div style={styles.locationSection}>
              <label style={styles.smallLabel}>Décrire la Localisation :</label>
              <input 
                type="text" 
                placeholder="Ex: Près de l'entrée principale, Couloir du 2ème étage..." 
                value={otherLocation} 
                onChange={(e) => setOtherLocation(e.target.value)}
                style={styles.selectInput}
                required
              />
              <small style={styles.helpText}>
                Soyez le plus précis possible pour faciliter l'intervention
              </small>
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

          {/* Section Photos */}
          <div style={styles.mediaSection}>
            <h3 style={styles.mediaTitle}>📷 Photos du problème (max 3)</h3>

            {/* Afficher la caméra si active */}
            {isCameraActive && (
              <div style={styles.cameraContainer}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={styles.video}
                />
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  style={{display: 'none'}}
                />
                <div style={styles.mediaButtons}>
                  <button type="button" onClick={capturePhoto} style={styles.captureBtn}>
                    📸 Capturer
                  </button>
                  <button type="button" onClick={stopCamera} style={styles.cancelBtn}>
                    ✖️ Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Afficher les photos capturées */}
            {photos.length > 0 && (
              <div style={styles.photosGrid}>
                {photos.map((photo, index) => (
                  <div key={index} style={styles.photoItem}>
                    <img src={photo.preview} alt={`Photo ${index + 1}`} style={styles.photoThumb} />
                    <button
                      type="button"
                      onClick={() => deletePhoto(index)}
                      style={styles.photoDeleteBtn}
                    >
                      ✖️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Boutons d'action si pas de caméra active */}
            {!isCameraActive && photos.length < 3 && (
              <div style={styles.photoActions}>
                <button type="button" onClick={startCamera} style={styles.primaryBtn}>
                  📸 Prendre une photo
                </button>
                <label htmlFor="file-upload" style={styles.uploadBtn}>
                  📁 Choisir des fichiers
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                />
              </div>
            )}

            {photos.length === 0 && !isCameraActive && (
              <p style={styles.photoPlaceholderText}>Aucune photo ajoutée</p>
            )}

            {photos.length > 0 && (
              <p style={styles.successText}>
                ✓ {photos.length} photo(s) ajoutée(s) ({3 - photos.length} restante(s))
              </p>
            )}
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
  locationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
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
  cameraContainer: { marginBottom: '15px' },
  video: { width: '100%', maxHeight: '400px', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#000', display: 'block', objectFit: 'cover' },
  audioPlayer: { backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px' },
  audioControls: { width: '100%', height: '32px' },
  mediaButtons: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  mediaBtn: { padding: '10px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', flex: '1', minWidth: '100px' },
  successText: { color: '#16a34a', fontWeight: 'bold', fontSize: '13px', margin: '5px 0 0 0' },
  submitBtn: { padding: '15px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  // Nouveaux styles pour les photos
  photoPlaceholderText: { color: '#6b7280', fontSize: '14px', margin: '10px 0', textAlign: 'center' },
  primaryBtn: { padding: '12px 24px', backgroundColor: '#005596', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', flex: 1 },
  captureBtn: { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', flex: '1', minWidth: '120px' },
  cancelBtn: { padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', flex: '1', minWidth: '120px' },
  photosGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' },
  photoItem: { position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e5e7eb' },
  photoThumb: { width: '100%', height: '100%', objectFit: 'cover' },
  photoDeleteBtn: { position: 'absolute', top: '5px', right: '5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photoActions: { display: 'flex', gap: '10px', marginBottom: '10px' },
  uploadBtn: { padding: '12px 24px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', flex: 1, textAlign: 'center', display: 'inline-block' },
  // Nouveaux styles pour le système de locaux
  helpText: { display: 'block', fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic' },
  noDataText: { color: '#f59e0b', fontSize: '13px', margin: '10px 0', padding: '10px', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #fed7aa' }
};