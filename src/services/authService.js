import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Inscription conforme aux spécifications Section 2.1 [cite: 18, 20]
export const registerUser = async (userData) => {
  // 1. Création Auth
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;

  // 2. Création Profil Firestore avec les champs du PDF
  const userProfile = {
    uid: user.uid,
    prenom: userData.prenom, // 
    nom: userData.nom,       // 
    email: userData.email,   // 
    telephone: userData.telephone, //  - Champ ajouté
    pavillon: userData.pavillon,   // 
    chambre: userData.chambre,     // 
    role: "student", 
    accountStatus: "pending", // Pour la validation Admin future 
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", user.uid), userProfile);
  return userProfile;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data();
  throw new Error("Profil introuvable");
};

export const logoutUser = async () => {
  await signOut(auth);
};