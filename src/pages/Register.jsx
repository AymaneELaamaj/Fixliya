import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    if (formData.password.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères.");
    }

    setLoading(true);
    try {
      await registerUser(formData);
      navigate('/login'); 
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription. Vérifiez les champs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pattern de fond */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-strong p-8 md:p-10 animate-fade-in">
          {/* Logo/Icône */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">Fix</span>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Rejoignez la plateforme FixLiya
          </p>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nom et Prénom sur la même ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Prénom"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Nom"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email étudiant
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@university.ma"
                className="input-field"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+212 6XX XXX XXX"
                className="input-field"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Création du compte...</span>
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Footer - Lien vers Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Message info en bas */}
        <div className="mt-4 text-center">
          <p className="text-white text-xs opacity-80">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
