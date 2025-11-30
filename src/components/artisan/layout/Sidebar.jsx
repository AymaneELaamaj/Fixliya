import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArtisanUnreadCount } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Barre latérale de navigation pour l'artisan - Version Tailwind CSS
 */
export const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobile }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.uid) {
        const count = await getArtisanUnreadCount(user.uid);
        setUnreadCount(count);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (isMobile) {
    // Navbar mobile en bas
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-primary to-primary-dark flex justify-around items-center px-3 shadow-strong z-50">
        <button
          onClick={() => setActiveTab('todo')}
          className={`
            flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
            ${activeTab === 'todo' 
              ? 'bg-white bg-opacity-20 text-white font-bold' 
              : 'text-white text-opacity-70 font-medium'
            }
          `}
        >
          <span className="text-xl">📋</span>
          <span className="text-xs">Ma Journée</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`
            flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
            ${activeTab === 'history' 
              ? 'bg-white bg-opacity-20 text-white font-bold' 
              : 'text-white text-opacity-70 font-medium'
            }
          `}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs">Historique</span>
        </button>

        <button
          onClick={() => navigate('/app/artisan/notifications')}
          className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-white text-opacity-70 font-medium hover:bg-white hover:bg-opacity-10"
        >
          <span className="text-xl">🔔</span>
          <span className="text-xs">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-white text-opacity-70 font-medium hover:bg-red-500 hover:bg-opacity-20"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs">Déconnexion</span>
        </button>
      </nav>
    );
  }

  // Desktop sidebar
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-primary to-primary-dark text-white shadow-strong flex flex-col z-40">
      {/* Header */}
      <div className="p-6 border-b border-white border-opacity-20">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🛠️</span>
          <span>Artisan</span>
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => setActiveTab('todo')}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            ${activeTab === 'todo' 
              ? 'bg-white bg-opacity-20 shadow-md font-semibold' 
              : 'hover:bg-white hover:bg-opacity-10 font-medium'
            }
          `}
        >
          <span className="text-2xl">📋</span>
          <span>Ma Journée</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            ${activeTab === 'history' 
              ? 'bg-white bg-opacity-20 shadow-md font-semibold' 
              : 'hover:bg-white hover:bg-opacity-10 font-medium'
            }
          `}
        >
          <span className="text-2xl">📊</span>
          <span>Historique & Avis</span>
        </button>

        <button
          onClick={() => navigate('/app/artisan/notifications')}
          className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white hover:bg-opacity-10 font-medium mt-2"
        >
          <span className="text-2xl">🔔</span>
          <span className="flex-1 text-left">Notifications</span>
          {unreadCount > 0 && (
            <span className="w-6 h-6 bg-danger rounded-full text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-white border-opacity-20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 bg-opacity-80 hover:bg-opacity-100 transition-all font-semibold"
        >
          <span className="text-2xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
