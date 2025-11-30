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

  // États du formulaire
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ticketType, setTicketType] = useState("urgent");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  // Photo (1 élément max)
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

  // Références
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioTimerRef = useRef(null);

  const categories = ["Plomberie", "Électricité", "Ménage", "Wifi", "Autre"];

  // Charger l'utilisateur
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

  // Charger les lieux
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

  // Nettoyage mémoire
  useEffect(() => {
    return () => {
      photos.forEach(photo => { if (photo.preview) URL.revokeObjectURL(photo.preview); });
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
      stopCamera();
    };
  }, []); // eslint-disable-line

  // LOGIQUE CAMÉRA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }
      });
      
      streamRef.current = stream;
      setIsCameraActive(true);
      
    } catch (err) {
      console.error("Erreur accès caméra:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.log("Erreur lecture auto:", e));
    }
  }, [isCameraActive]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
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
        setPhotos([newPhoto]); 
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

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

  // LOGIQUE AUDIO (10s Max)
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

      audioTimerRef.current = setTimeout(() => {
        stopAudioRecording();
      }, 10000);

    } catch (err) {
      console.error('Erreur microphone:', err);
      alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
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

  // SOUMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !locationType) return;
    
    if (locationType === "building" && (!selectedLocal || !roomNumber)) return;
    if (locationType === "common_area" && !selectedLocal) return;
    if (locationType === "other" && !otherLocation.trim()) return;
    if (ticketType === "planifier" && (!scheduledDate || !scheduledTime)) return;

    setLoading(true);
    try {
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

  // RENDER
  if (isAccountDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-strong p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Compte Désactivé</h2>
          <p className="text-gray-600">Votre compte a été temporairement désactivé. Contactez l'administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-strong p-6 md:p-8 animate-fade-in">
          {/* Titre */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              🔧 Nouveau Signalement
            </h2>
            <p className="text-gray-500 text-sm">
              Décrivez le problème pour une intervention rapide
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CATÉGORIES */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Type de panne :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`
                      py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200
                      ${category === cat 
                        ? 'bg-primary text-white shadow-md scale-105 border-2 border-primary' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* LOCALISATION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📍 Localisation :
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setLocationType("building"); setSelectedLocal(null); }}
                  className={`
                    py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200
                    ${locationType === "building"
                      ? 'bg-green-100 text-green-700 border-2 border-green-500 shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  🏢 Bâtiment
                </button>
                <button
                  type="button"
                  onClick={() => { setLocationType("common_area"); setSelectedLocal(null); }}
                  className={`
                    py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200
                    ${locationType === "common_area"
                      ? 'bg-green-100 text-green-700 border-2 border-green-500 shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  🏛️ Espace
                </button>
                <button
                  type="button"
                  onClick={() => { setLocationType("other"); setSelectedLocal(null); }}
                  className={`
                    py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200
                    ${locationType === "other"
                      ? 'bg-green-100 text-green-700 border-2 border-green-500 shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  📝 Autre
                </button>
              </div>

              {/* Détails localisation */}
              {locationType === "building" && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                  <select
                    className="input-field"
                    value={selectedLocal?.id || ""}
                    onChange={(e) => setSelectedLocal(buildings.find(b => b.id === e.target.value))}
                    required
                  >
                    <option value="">-- Choisir Bâtiment --</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {selectedLocal && (
                    <input
                      className="input-field"
                      placeholder="Numéro de chambre"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      required
                    />
                  )}
                </div>
              )}

              {locationType === "common_area" && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <select
                    className="input-field"
                    value={selectedLocal?.id || ""}
                    onChange={(e) => setSelectedLocal(commonAreas.find(b => b.id === e.target.value))}
                    required
                  >
                    <option value="">-- Choisir Espace Commun --</option>
                    {commonAreas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              {locationType === "other" && (
                <input
                  className="input-field"
                  placeholder="Décrire l'endroit..."
                  value={otherLocation}
                  onChange={e => setOtherLocation(e.target.value)}
                  required
                />
              )}
            </div>

            {/* URGENCE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priorité :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTicketType("urgent")}
                  className={`
                    py-3 px-4 rounded-xl font-medium transition-all duration-200
                    ${ticketType === "urgent"
                      ? 'bg-red-100 text-red-700 border-2 border-red-500 shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  🚨 Urgent
                </button>
                <button
                  type="button"
                  onClick={() => setTicketType("planifier")}
                  className={`
                    py-3 px-4 rounded-xl font-medium transition-all duration-200
                    ${ticketType === "planifier"
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  📅 Planifier
                </button>
              </div>

              {ticketType === "planifier" && (
                <div className="mt-3 bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-3">
                  <p className="text-sm text-blue-700 font-medium">Date et heure souhaitées :</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="input-field"
                      required
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description du problème :
              </label>
              <textarea
                placeholder="Décrivez le problème en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                required
              />
            </div>

            {/* ZONE PHOTO */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📷</span>
                <span>Photo (Obligatoire)</span>
              </h3>
              
              <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-400 relative">
                {/* ÉTAT 1 : VIDE */}
                {photos.length === 0 && !isCameraActive && (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <div className="text-6xl mb-3">🖼️</div>
                    <p className="text-gray-500 text-sm mb-4">Aucune photo</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn-primary px-6 py-3"
                    >
                      📸 Prendre une photo
                    </button>
                  </div>
                )}

                {/* ÉTAT 2 : CAMÉRA ACTIVE */}
                {isCameraActive && (
                  <div className="h-full relative flex flex-col">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-110 transition-transform"
                        title="Capturer"
                      />
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAT 3 : PHOTO PRISE */}
                {photos.length > 0 && !isCameraActive && (
                  <div className="h-full relative">
                    <img
                      src={photos[0].preview}
                      alt="Photo ticket"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={deletePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white rounded-full font-semibold shadow-lg hover:bg-red-600 transition-colors"
                    >
                      🗑️ Refaire
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ZONE AUDIO */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎙️</span>
                <span>Message vocal (Max 10s)</span>
              </h3>
              
              {!audioFile ? (
                <div className="text-center">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startAudioRecording}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      🎤 Appuyer pour parler
                    </button>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-red-600 font-bold">Enregistrement en cours...</p>
                      </div>
                      <button
                        type="button"
                        onClick={stopAudioRecording}
                        className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ⏹️ Arrêter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 space-y-3 border border-purple-200">
                  <audio
                    src={getAudioURL()}
                    controls
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={deleteAudioRecording}
                    className="w-full py-2 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️ Supprimer le vocal
                  </button>
                </div>
              )}
            </div>

            {/* BOUTON SUBMIT */}
            <button
              type="submit"
              disabled={loading || photos.length === 0}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                '🚀 Envoyer le signalement'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
