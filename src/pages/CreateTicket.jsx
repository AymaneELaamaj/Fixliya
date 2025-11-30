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

  // --- États du formulaire ---
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ticketType, setTicketType] = useState("urgent");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  // Photo (Tableau limité à 1 élément)
  const [photos, setPhotos] = useState([]); 
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Audio
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Localisation
  const [locationType, setLocationType] = useState("");
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [commonAreas, setCommonAreas] = useState([]);
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);
  const [userData, setUserData] = useState(null);

  // --- Références ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null); // Stocke le flux caméra
  const audioTimerRef = useRef(null); // Minuteur audio

  const categories = ["Plomberie", "Électricité", "Ménage", "Wifi", "Autre"];

  // 1. Charger l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          if (data.isActive === false) setIsAccountDisabled(true);
        }
      }
    };
    fetchUser();
  }, []);

  // 2. Charger les lieux
  useEffect(() => {
    const fetchLocals = async () => {
      try {
        const { getAllLocals } = await import('../services/localService');
        const locals = await getAllLocals();
        setBuildings(locals.filter(local => local.type === LOCAL_TYPES.BUILDING && local.isActive));
        setCommonAreas(locals.filter(local => local.type === LOCAL_TYPES.COMMON_AREA && local.isActive));
      } catch (error) {
        console.error("Erreur chargement locaux:", error);
      }
    };
    fetchLocals();
  }, []);

  // 3. Nettoyage mémoire
  useEffect(() => {
    return () => {
      photos.forEach(photo => { if (photo.preview) URL.revokeObjectURL(photo.preview); });
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
      stopCamera(); // Sécurité
    };
  }, []); // eslint-disable-line

  // --- LOGIQUE CAMÉRA CORRIGÉE ---

  // Étape A : Demander l'accès et stocker le flux
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Caméra arrière
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }
      });
      
      streamRef.current = stream;
      setIsCameraActive(true); // Cela va déclencher le useEffect ci-dessous
      
    } catch (err) {
      console.error("Erreur accès caméra:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  // Étape B : Attacher le flux à la balise <video> une fois qu'elle est affichée (Le FIX est ici)
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.log("Erreur lecture auto:", e));
    }
  }, [isCameraActive]);

  // Étape C : Capturer
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Dessiner l'image vidéo sur le canvas
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        const newPhoto = {
          file: blob,
          preview: previewUrl,
          source: 'camera'
        };
        // On remplace le tableau existant (1 seule photo max)
        setPhotos([newPhoto]); 
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  // Étape D : Arrêter
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

  const deletePhoto = () => {
    if (photos[0]?.preview) URL.revokeObjectURL(photos[0].preview);
    setPhotos([]);
  };

  // --- LOGIQUE AUDIO (10s Max) ---

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioFile(audioBlob);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Arrêt automatique après 10 secondes
      audioTimerRef.current = setTimeout(() => {
        stopAudioRecording();
      }, 10000);

    } catch (err) {
      console.error('Erreur microphone:', err);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    setIsRecording(false);
  };

  const deleteAudioRecording = () => {
    setAudioFile(null);
    mediaRecorderRef.current = null;
  };

  const getAudioURL = () => audioFile ? URL.createObjectURL(audioFile) : null;

  // --- SOUMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !locationType) return;
    
    // Validation minimale
    if (locationType === "building" && (!selectedLocal || !roomNumber)) return;
    if (locationType === "common_area" && !selectedLocal) return;
    if (locationType === "other" && !otherLocation.trim()) return;
    if (ticketType === "planifier" && (!scheduledDate || !scheduledTime)) return;

    setLoading(true);
    try {
      // Construction adresse
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

      // Upload Photo
      let imageUrls = [];
      if (photos.length > 0) {
        const photo = photos[0];
        const imageRef = ref(storage, `tickets/${auth.currentUser.uid}/${Date.now()}_photo.jpg`);
        await uploadBytes(imageRef, photo.file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      // Upload Audio
      let audioUrl = null;
      if (audioFile) {
        const audioRef = ref(storage, `tickets/${auth.currentUser.uid}/${Date.now()}_audio.mp3`);
        await uploadBytes(audioRef, audioFile);
        audioUrl = await getDownloadURL(audioRef);
      }

      const ticketData = {
        studentId: auth.currentUser.uid,
        studentName: userData ? `${userData.prenom} ${userData.nom}` : "Étudiant",
        location, localId, localName, category, description, locationType,
        roomNumber: locationType === "building" ? roomNumber : null,
        isUrgent: ticketType === "urgent",
        ticketType,
        scheduledDate: ticketType === "planifier" ? scheduledDate : null,
        scheduledTime: ticketType === "planifier" ? scheduledTime : null,
        scheduledDateTime: ticketType === "planifier" ? `${scheduledDate} ${scheduledTime}` : null,
        imageUrls, 
        audioUrl
      };

      await createTicket(ticketData);
      navigate('/app/student');
    } catch (err) {
      console.error('Erreur création:', err);
      alert("Erreur lors de l'envoi du ticket. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div style={styles.container}>
      {isAccountDisabled ? (
        <div style={styles.disabledCard}><h2>Compte Désactivé</h2></div>
      ) : (
        <div style={styles.card}>
        <h2 style={styles.title}>🔧 Nouveau Signalement</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Catégories */}
          <label style={styles.label}>Type de panne :</label>
          <div style={styles.grid}>
            {categories.map((cat) => (
              <button type="button" key={cat} onClick={() => setCategory(cat)}
                style={category === cat ? styles.catButtonActive : styles.catButton}>
                {cat}
              </button>
            ))}
          </div>

          {/* Localisation */}
          <label style={styles.label}>📍 Localisation :</label>
           <div style={styles.locationGrid}>
            <button type="button" onClick={() => { setLocationType("building"); setSelectedLocal(null); }}
              style={locationType === "building" ? styles.locationButtonActive : styles.locationButton}>🏢 Bâtiment</button>
            <button type="button" onClick={() => { setLocationType("common_area"); setSelectedLocal(null); }}
              style={locationType === "common_area" ? styles.locationButtonActive : styles.locationButton}>🏛️ Espace Commun</button>
            <button type="button" onClick={() => { setLocationType("other"); setSelectedLocal(null); }}
              style={locationType === "other" ? styles.locationButtonActive : styles.locationButton}>📝 Autre</button>
          </div>

          {locationType === "building" && (
            <div style={styles.locationSection}>
                <select style={styles.select} value={selectedLocal?.id || ""} onChange={(e) => setSelectedLocal(buildings.find(b => b.id === e.target.value))}>
                    <option value="">-- Choisir Bâtiment --</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {selectedLocal && <input style={{...styles.selectInput, marginTop: 10}} placeholder="Numéro Chambre" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />}
            </div>
          )}
           {locationType === "common_area" && (
            <div style={styles.locationSection}>
                <select style={styles.select} value={selectedLocal?.id || ""} onChange={(e) => setSelectedLocal(commonAreas.find(b => b.id === e.target.value))}>
                    <option value="">-- Choisir Espace --</option>
                    {commonAreas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
          )}
          {locationType === "other" && (
             <input style={styles.selectInput} placeholder="Décrire l'endroit..." value={otherLocation} onChange={e => setOtherLocation(e.target.value)} required />
          )}

          {/* Urgence */}
          <div style={{marginTop: 15, ...styles.typeGrid}}>
             <button type="button" onClick={() => setTicketType("urgent")} style={ticketType === "urgent" ? styles.typeButtonActive : styles.typeButton}>🚨 Urgent</button>
             <button type="button" onClick={() => setTicketType("planifier")} style={ticketType === "planifier" ? styles.typeButtonActive : styles.typeButton}>📅 Planifier</button>
          </div>
          
           {ticketType === "planifier" && (
            <div style={styles.schedulingSection}>
              <div style={styles.row}>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={styles.select} required />
                <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={styles.select} required />
              </div>
            </div>
          )}

          {/* Description */}
          <textarea placeholder="Description du problème..." value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textarea} required />

          {/* --- ZONE PHOTO (1 PHOTO) --- */}
          <div style={styles.mediaSection}>
            <h3 style={styles.mediaTitle}>📷 Photo (Obligatoire)</h3>
            
            <div style={styles.photoContainer}>
              
              {/* ÉTAT 1 : VIDE */}
              {photos.length === 0 && !isCameraActive && (
                <div style={styles.emptyPhotoState}>
                   <div style={{fontSize: '40px', marginBottom: '10px'}}>🖼️</div>
                   <p style={{color: '#6b7280', fontSize: '14px', marginBottom: '15px'}}>Aucune photo</p>
                   <button type="button" onClick={startCamera} style={styles.primaryBtn}>
                    📸 Prendre une photo
                   </button>
                </div>
              )}

              {/* ÉTAT 2 : CAMÉRA ACTIVE */}
              {isCameraActive && (
                <div style={{width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column'}}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={styles.video} 
                  />
                  <canvas ref={canvasRef} style={{display: 'none'}} />
                  
                  <div style={styles.cameraOverlay}>
                    <button type="button" onClick={capturePhoto} style={styles.captureBtnLarge} title="Prendre la photo"></button>
                    <button type="button" onClick={stopCamera} style={styles.closeCameraBtn}>Annuler</button>
                  </div>
                </div>
              )}

              {/* ÉTAT 3 : PHOTO PRISE */}
              {photos.length > 0 && !isCameraActive && (
                <div style={{width: '100%', height: '100%', position: 'relative'}}>
                  <img src={photos[0].preview} alt="Preuve" style={styles.finalImage} />
                  <button type="button" onClick={deletePhoto} style={styles.retakeBtn}>
                    🗑️ Refaire
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* --- ZONE AUDIO (10s) --- */}
          <div style={styles.mediaSection}>
            <h3 style={styles.mediaTitle}>🎙️ Vocal (Max 10s)</h3>
            
            {!audioFile ? (
              <div style={{textAlign: 'center'}}>
                {!isRecording ? (
                  <button type="button" onClick={startAudioRecording} style={styles.mediaBtn}>
                    🎤 Appuyer pour parler
                  </button>
                ) : (
                  <div style={styles.recordingState}>
                    <div style={styles.recordingDot}></div>
                    <p style={{color: '#dc2626', fontWeight: 'bold'}}>Enregistrement... (Max 10s)</p>
                    <button type="button" onClick={stopAudioRecording} style={styles.stopBtn}>
                      ⏹️ Stop
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.audioPreview}>
                 <audio src={getAudioURL()} controls style={{width: '100%', marginBottom: '10px'}} />
                 <button type="button" onClick={deleteAudioRecording} style={styles.deleteAudioBtn}>
                   🗑️ Supprimer le vocal
                 </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? 'Envoi...' : '🚀 Envoyer le signalement'}
          </button>

        </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', paddingTop: '40px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  disabledCard: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { textAlign: 'center', color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '800' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  
  label: { fontWeight: '700', fontSize: '15px', color: '#1f2937', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  catButton: { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white' },
  catButtonActive: { padding: '12px', border: '2px solid #667eea', borderRadius: '10px', background: '#eef2ff', color: '#667eea', fontWeight: 'bold' },
  
  locationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  locationButton: { padding: '10px', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '12px' },
  locationButtonActive: { padding: '10px', border: '2px solid #10b981', borderRadius: '10px', background: '#ecfdf5', color: '#059669', fontWeight: 'bold', fontSize: '12px' },
  
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' },
  selectInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' },
  textarea: { padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', minHeight: '80px', width: '100%' },
  
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  typeButton: { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white', fontSize: '13px' },
  typeButtonActive: { padding: '12px', border: '2px solid #ef4444', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', fontWeight: 'bold', fontSize: '13px' },
  schedulingSection: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb' },
  row: { display: 'flex', gap: '10px' },
  locationSection: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb' },

  mediaSection: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' },
  mediaTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: '#374151' },
  
  photoContainer: {
    width: '100%',
    height: '250px',
    backgroundColor: '#e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #9ca3af'
  },
  emptyPhotoState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraOverlay: {
    position: 'absolute', bottom: '10px', left: '0', width: '100%',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px'
  },
  captureBtnLarge: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white', border: '4px solid #e5e7eb', cursor: 'pointer' },
  closeCameraBtn: { padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' },
  finalImage: { width: '100%', height: '100%', objectFit: 'cover' },
  retakeBtn: {
    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  },
  
  mediaBtn: { padding: '12px', width: '100%', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  recordingState: { padding: '15px', backgroundColor: '#fee2e2', borderRadius: '10px', border: '1px solid #ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  recordingDot: { width: '15px', height: '15px', backgroundColor: '#dc2626', borderRadius: '50%' },
  stopBtn: { padding: '8px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  audioPreview: { backgroundColor: 'white', padding: '10px', borderRadius: '10px' },
  deleteAudioBtn: { width: '100%', padding: '8px', backgroundColor: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' },
  
  submitBtn: { padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }
};