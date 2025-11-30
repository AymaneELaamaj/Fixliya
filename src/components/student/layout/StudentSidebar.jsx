import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../../services/authService';

export default function StudentSidebar({ 
  userName, 
  userEmail, 
  unreadNotifications = 0,
  activeTicketsCount = 0 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'tickets',
      label: 'Mes Réclamations',
      icon: '📋',
      path: '/app/student',
      badge: activeTicketsCount > 0 ? activeTicketsCount : null
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/app/student/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      badgeColor: 'danger'
    },
    {
      id: 'history',
      label: 'Historique',
      icon: '📊',
      path: '/app/student/history'
    },
    {
      id: 'new-ticket',
      label: 'Nouvelle Réclamation',
      icon: '➕',
      path: '/app/student/create-ticket',
      highlight: true
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: '👤',
      path: '/app/student/profile'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white p-3 rounded-lg shadow-medium hover:shadow-strong transition-shadow"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{isMobileOpen ? '✕' : '☰'}</span>
        </button>
      )}

      {/* Overlay pour mobile */}
      {isMobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-primary to-primary-dark text-white z-40
        transition-all duration-300 ease-in-out
        ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${isCollapsed && !isMobile ? 'w-20' : 'w-64'}
        lg:translate-x-0
        shadow-strong overflow-y-auto
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`
              font-bold text-xl
              ${isCollapsed && !isMobile ? 'hidden' : 'block'}
            `}>
              🏠 Résident
            </h2>
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
              </button>
            )}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <div className="space-y-1">
              <p className="font-semibold text-base truncate">{userName}</p>
              <p className="text-sm text-white text-opacity-75 truncate">{userEmail}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 group relative
                ${isActive(item.path) 
                  ? 'bg-white bg-opacity-20 shadow-md' 
                  : 'hover:bg-white hover:bg-opacity-10'
                }
                ${item.highlight ? 'bg-success hover:bg-green-600' : ''}
                ${isCollapsed && !isMobile ? 'justify-center' : ''}
              `}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  
                  {item.badge && (
                    <span className={`
                      inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full
                      text-xs font-bold
                      ${item.badgeColor === 'danger' ? 'bg-danger' : 'bg-white bg-opacity-30'}
                    `}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Badge pour mode collapsed */}
              {isCollapsed && !isMobile && item.badge && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-danger rounded-full text-xs flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-white border-opacity-20">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-red-500 bg-opacity-80 hover:bg-opacity-100
              transition-all duration-200
              ${isCollapsed && !isMobile ? 'justify-center' : ''}
            `}
          >
            <span className="text-2xl">🚪</span>
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left font-medium">Déconnexion</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
