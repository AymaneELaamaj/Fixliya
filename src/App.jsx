// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider> {/* 1. On enveloppe l'app avec la sécurité */}
      <BrowserRouter> {/* 2. On active la navigation */}
        <Routes>
          {/* Redirection par défaut vers Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* La page Login */}
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
  
export default App;