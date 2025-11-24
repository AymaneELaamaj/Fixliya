// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Note les deux points ".." pour remonter d'un dossier

const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte facilement
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On écoute le Vigile Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("📢 État Auth changé :", user ? "Connecté" : "Déconnecté");
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Nettoyage
  }, []);

  const value = {
    currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}