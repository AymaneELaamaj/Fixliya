// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import CreateTicket from './pages/CreateTicket';
import StudentHistory from './pages/StudentHistory';
import NotificationsPage from './pages/NotificationsPage';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import ArtisanHome from './pages/ArtisanHome';

function App() {
  return (
    <AuthProvider> {/* 1. On enveloppe l'app avec la sécurité */}
      <BrowserRouter> {/* 2. On active la navigation */}
        <Routes>
          {/* Redirection par défaut vers Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* La page Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          {/* Routes étudiants */}
          <Route path="/app/student" element={<StudentHome />} />
          <Route path="/app/student/create-ticket" element={<CreateTicket />} />
          <Route path="/app/student/history" element={<StudentHistory />} />
          <Route path="/app/student/notifications" element={<NotificationsPage />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          
          {/* Routes admin et artisan */}
          <Route path="/app/admin" element={<AdminDashboard />} />
          <Route path="/app/artisan" element={<ArtisanHome />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;