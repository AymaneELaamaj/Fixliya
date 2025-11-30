import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getUserProfile } from "../services/authService"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // 1. Connexion Auth (Firebase Auth)
      const userAuth = await loginUser(email, password);
      
      // 2. Récupération du rôle dans Firestore
      const userProfile = await getUserProfile(userAuth.uid);

      // 3. Redirection conditionnelle selon le rôle
      if (userProfile.role === 'admin') {
        navigate('/app/admin');
      } else if (userProfile.role === 'artisan') {
        navigate('/app/artisan');
      } else {
        navigate('/app/student'); 
      }
    } catch (err) {
      console.error(err);
      setError("Erreur : Identifiants incorrects ou compte introuvable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-secondary p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-strong p-8 md:p-10">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FixLiya</h1>
            <p className="text-gray-600">Gestion de réclamations</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input 
                id="email"
                type="email" 
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connexion...</span>
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien inscription */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-white text-opacity-80 text-sm">
          <p>© 2025 FixLiya - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
