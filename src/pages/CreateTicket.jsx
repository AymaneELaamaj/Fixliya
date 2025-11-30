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
        <h2 style={styles.title}>🔧 Nouveau Signalement</h2>
        <p style={{textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '25px', marginTop: '-15px'}}>
          Décrivez votre problème et ajoutez des preuves visuelles ou audio
        </p>
        
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{...styles.mediaTitle, margin: 0}}>📷 Photos du problème</h3>
              <span style={{
                fontSize: '13px', 
                fontWeight: '700', 
                color: photos.length >= 3 ? '#059669' : '#6b7280',
                backgroundColor: photos.length >= 3 ? '#d1fae5' : '#f3f4f6',
                padding: '6px 12px',
                borderRadius: '20px',
                border: `2px solid ${photos.length >= 3 ? '#10b981' : '#d1d5db'}`
              }}>
                {photos.length}/3
              </span>
            </div>

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
                    📸 Capturer la photo
                  </button>
                  <button type="button" onClick={stopCamera} style={styles.cancelBtn}>
                    ❌ Annuler
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
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      #{index + 1}
                    </div>
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
                  📸 Ouvrir la caméra
                </button>
                <label htmlFor="file-upload" style={styles.uploadBtn}>
                  📁 Importer des photos
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
              <div style={{
                textAlign: 'center',
                padding: '30px 20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #d1d5db',
                marginTop: '10px'
              }}>
                <div style={{fontSize: '48px', marginBottom: '10px'}}>📷</div>
                <p style={styles.photoPlaceholderText}>Aucune photo ajoutée</p>
                <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>
                  Ajoutez des photos pour illustrer le problème
                </p>
              </div>
            )}

            {photos.length > 0 && (
              <p style={styles.successText}>
                ✓ {photos.length} photo(s) prête(s) • {3 - photos.length} place(s) disponible(s)
              </p>
            )}
          </div>

          {/* Section Audio */}
          <div style={styles.mediaSection}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{...styles.mediaTitle, margin: 0}}>🎙️ Enregistrement vocal</h3>
              {audioFile && (
                <span style={{
                  fontSize: '13px', 
                  fontWeight: '700', 
                  color: '#059669',
                  backgroundColor: '#d1fae5',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '2px solid #10b981'
                }}>
                  ✓ Prêt
                </span>
              )}
            </div>
            
            {!audioFile ? (
              <>
                {!isRecording ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '30px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db',
                    marginBottom: '12px'
                  }}>
                    <div style={{fontSize: '48px', marginBottom: '10px'}}>🎤</div>
                    <p style={{fontSize: '14px', color: '#6b7280', margin: '0 0 15px 0', fontWeight: '600'}}>
                      Enregistrez un message vocal
                    </p>
                    <p style={{fontSize: '12px', color: '#9ca3af', margin: '0 0 20px 0'}}>
                      Décrivez le problème avec vos propres mots
                    </p>
                    <button type="button" onClick={startAudioRecording} style={styles.mediaBtn}>
                      🎤 Démarrer l'enregistrement
                    </button>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '30px 20px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '12px',
                    border: '2px solid #ef4444',
                    marginBottom: '12px',
                    animation: 'pulse 2s infinite'
                  }}>
                    <div style={{fontSize: '48px', marginBottom: '10px'}}>🔴</div>
                    <p style={{fontSize: '16px', color: '#dc2626', margin: '0 0 15px 0', fontWeight: '700'}}>
                      🔴 Enregistrement en cours...
                    </p>
                    <p style={{fontSize: '13px', color: '#991b1b', margin: '0 0 20px 0'}}>
                      Parlez clairement dans votre microphone
                    </p>
                    <button 
                      type="button" 
                      onClick={stopAudioRecording} 
                      style={{
                        ...styles.mediaBtn, 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      ⏹️ Arrêter l'enregistrement
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#d1fae5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🎵
                    </div>
                    <div style={{flex: 1}}>
                      <p style={{margin: 0, fontSize: '14px', fontWeight: '700', color: '#1f2937'}}>
                        Message vocal enregistré
                      </p>
                      <p style={{margin: 0, fontSize: '12px', color: '#6b7280'}}>
                        Écoutez votre enregistrement ci-dessous
                      </p>
                    </div>
                  </div>
                  <audio 
                    src={getAudioURL()} 
                    controls 
                    style={{...styles.audioControls, borderRadius: '8px'}}
                  />
                </div>
                <div style={styles.mediaButtons}>
                  <button 
                    type="button" 
                    onClick={deleteAudioRecording} 
                    style={{
                      ...styles.mediaBtn, 
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      deleteAudioRecording();
                      setTimeout(startAudioRecording, 300);
                    }} 
                    style={{
                      ...styles.mediaBtn, 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    🔄 Réenregistrer
                  </button>
                </div>
                <p style={styles.successText}>
                  ✓ Audio prêt à être envoyé avec votre signalement
                </p>
              </>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }} 
            disabled={loading}
          >
            {loading ? (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}></span>
                Envoi en cours...
              </span>
            ) : (
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                🚀 Envoyer le signalement
              </span>
            )}
          </button>
        </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: '20px', 
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    minHeight: '100vh', 
    display: 'flex', 
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '40px'
  },
  card: { 
    backgroundColor: 'white', 
    padding: '30px', 
    borderRadius: '20px', 
    width: '100%', 
    maxWidth: '600px', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.5s ease-out'
  },
  disabledCard: { 
    backgroundColor: 'white', 
    padding: '40px', 
    borderRadius: '20px', 
    width: '100%', 
    maxWidth: '400px', 
    textAlign: 'center', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
  },
  disabledIconLarge: { fontSize: '80px', marginBottom: '20px' },
  disabledTitle: { fontSize: '28px', color: '#dc2626', fontWeight: 'bold', margin: '0 0 15px 0' },
  disabledMessage: { fontSize: '16px', color: '#991b1b', fontWeight: '600', margin: '0 0 10px 0' },
  disabledDescription: { fontSize: '14px', color: '#7f1d1d', margin: '0 0 25px 0', lineHeight: '1.6' },
  backBtn: { 
    backgroundColor: '#6b7280', 
    color: 'white', 
    border: 'none', 
    padding: '14px 28px', 
    borderRadius: '12px', 
    fontSize: '15px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  title: { 
    color: '#1f2937', 
    marginBottom: '25px', 
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  label: { 
    fontWeight: '700', 
    fontSize: '15px', 
    color: '#1f2937',
    marginBottom: '8px',
    display: 'block'
  },
  smallLabel: { fontWeight: '600', fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  locationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  catButton: { 
    padding: '14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    background: 'white', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  catButtonActive: { 
    padding: '14px', 
    border: '2px solid #667eea', 
    borderRadius: '12px', 
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
    color: '#667eea', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(-2px)'
  },
  locationButton: { 
    padding: '14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    background: 'white', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  locationButtonActive: { 
    padding: '14px', 
    border: '2px solid #10b981', 
    borderRadius: '12px', 
    background: 'linear-gradient(135deg, #10b98115 0%, #059669 15 100%)', 
    color: '#059669', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '13px',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
    transform: 'translateY(-2px)'
  },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  typeButton: { 
    padding: '14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    background: 'white', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  typeButtonActive: { 
    padding: '14px', 
    border: '2px solid #ef4444', 
    borderRadius: '12px', 
    background: 'linear-gradient(135deg, #ef444415 0%, #dc262615 100%)', 
    color: '#dc2626', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '13px',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
    transform: 'translateY(-2px)'
  },
  schedulingSection: { 
    backgroundColor: '#f9fafb', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #e5e7eb' 
  },
  locationSection: { 
    backgroundColor: '#f9fafb', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #e5e7eb' 
  },
  row: { display: 'flex', gap: '12px' },
  inputGroup: { flex: 1 },
  select: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '2px solid #e5e7eb', 
    fontSize: '14px', 
    backgroundColor: 'white',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  selectInput: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '2px solid #e5e7eb', 
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  urgentBox: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    backgroundColor: '#fee2e2', 
    padding: '12px', 
    borderRadius: '12px', 
    border: '2px solid #ef4444' 
  },
  urgentLabel: { color: '#991b1b', fontWeight: 'bold', fontSize: '14px' },
  textarea: { 
    padding: '12px', 
    borderRadius: '12px', 
    border: '2px solid #e5e7eb', 
    minHeight: '100px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.3s ease'
  },
  input: { padding: '12px' },
  mediaSection: { 
    backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 
    padding: '20px', 
    borderRadius: '16px', 
    border: '2px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  mediaTitle: { 
    margin: '0 0 15px 0', 
    color: '#1f2937', 
    fontSize: '18px', 
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cameraContainer: { 
    marginBottom: '15px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    position: 'relative'
  },
  video: { 
    width: '100%', 
    maxHeight: '400px', 
    backgroundColor: '#000', 
    display: 'block', 
    objectFit: 'cover' 
  },
  audioPlayer: { 
    backgroundColor: 'white', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #e5e7eb', 
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  audioControls: { width: '100%', height: '40px' },
  mediaButtons: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '10px', 
    marginBottom: '10px',
    marginTop: '15px'
  },
  mediaBtn: { 
    padding: '12px 16px', 
    backgroundColor: '#667eea', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '14px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    flex: '1', 
    minWidth: '120px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  successText: { 
    color: '#059669', 
    fontWeight: '700', 
    fontSize: '14px', 
    margin: '8px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  submitBtn: { 
    padding: '16px', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '14px', 
    fontWeight: 'bold', 
    fontSize: '17px', 
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    marginTop: '10px'
  },
  photoPlaceholderText: { 
    color: '#9ca3af', 
    fontSize: '14px', 
    margin: '15px 0', 
    textAlign: 'center',
    fontStyle: 'italic'
  },
  primaryBtn: { 
    padding: '12px 20px', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    flex: 1,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  captureBtn: { 
    padding: '14px 20px', 
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '15px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    flex: '1', 
    minWidth: '130px',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease'
  },
  cancelBtn: { 
    padding: '14px 20px', 
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '15px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    flex: '1', 
    minWidth: '130px',
    boxShadow: '0 4px 16px rgba(107, 114, 128, 0.3)',
    transition: 'all 0.3s ease'
  },
  photosGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '12px', 
    marginBottom: '15px' 
  },
  photoItem: { 
    position: 'relative', 
    aspectRatio: '1', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    border: '3px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  photoThumb: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  photoDeleteBtn: { 
    position: 'absolute', 
    top: '8px', 
    right: '8px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '50%', 
    width: '28px', 
    height: '28px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  photoActions: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '12px' 
  },
  uploadBtn: { 
    padding: '12px 20px', 
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    transition: 'all 0.3s ease', 
    flex: 1, 
    textAlign: 'center', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },
  helpText: { 
    display: 'block', 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '6px', 
    fontStyle: 'italic' 
  },
  noDataText: { 
    color: '#d97706', 
    fontSize: '13px', 
    margin: '10px 0', 
    padding: '12px', 
    backgroundColor: '#fff7ed', 
    borderRadius: '10px', 
    border: '2px solid #fed7aa',
    fontWeight: '600'
  }
};