// src/components/admin/cards/LocalCard.jsx
import React, { useState } from 'react';
import { LOCAL_TYPES } from '../../../services/localService';

/**
 * Carte pour afficher un local dans la liste
 * Design responsive optimisé pour mobile
 */
export default function LocalCard({ local, onEdit, onDelete, onToggleStatus }) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${local.name}" ?`)) {
      setIsDeleting(true);
      try {
        await onDelete(local.id);
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await onToggleStatus(local.id, !local.isActive);
    } catch (error) {
      console.error("Erreur changement statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const getIcon = () => {
    if (local.type === LOCAL_TYPES.BUILDING) return '🏢';
    
    // Icônes spécifiques pour les espaces communs
    const icons = {
      'Buvette': '☕',
      'Terrain de sport': '⚽',
      'Salle d\'étude': '📚',
      'Parking': '🚗',
      'Buanderie': '🧺',
      'Salle de détente': '🛋️',
      'Bibliothèque': '📖',
      'Gymnase': '🏋️',
      'Cafétéria': '🍽️',
      'Jardin': '🌳'
    };
    
    return icons[local.category] || '🏛️';
  };

  return (
    <div className={`local-card ${!local.isActive ? 'inactive' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="icon">{getIcon()}</span>
          <div>
            <h4>{local.name}</h4>
            <span className="type-badge">
              {local.type === LOCAL_TYPES.BUILDING ? 'Bâtiment' : local.category}
            </span>
          </div>
        </div>
        
        <button 
          className="menu-btn"
          onClick={() => setShowActions(!showActions)}
          aria-label="Actions"
        >
          ⋮
        </button>
      </div>

      {/* Menu d'actions */}
      {showActions && (
        <div className="actions-menu">
          <button onClick={() => { onEdit(local); setShowActions(false); }}>
            ✏️ Modifier
          </button>
          <button onClick={() => { handleToggleStatus(); setShowActions(false); }}>
            {local.isActive ? '🔒 Désactiver' : '✅ Activer'}
          </button>
          <button 
            onClick={() => { handleDelete(); setShowActions(false); }}
            className="delete-btn"
            disabled={isDeleting}
          >
            {isDeleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
          </button>
        </div>
      )}

      {/* Informations du local */}
      <div className="card-body">
        {local.type === LOCAL_TYPES.BUILDING ? (
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Étages</span>
              <span className="value">{local.floors}</span>
            </div>
            <div className="info-item">
              <span className="label">Chambres</span>
              <span className="value">{local.totalRooms}</span>
            </div>
          </div>
        ) : (
          local.capacity && (
            <div className="info-item">
              <span className="label">Capacité</span>
              <span className="value">{local.capacity} personnes</span>
            </div>
          )
        )}

        {local.description && (
          <p className="description">{local.description}</p>
        )}

        {!local.isActive && (
          <div className="inactive-badge">
            ⚠️ Local désactivé
          </div>
        )}
      </div>

      <style jsx>{`
        .local-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s;
          position: relative;
        }

        .local-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .local-card.inactive {
          opacity: 0.7;
          background: #f9f9f9;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-title {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }

        .icon {
          font-size: 2rem;
          line-height: 1;
        }

        .card-title h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          color: #1a1a1a;
        }

        .type-badge {
          display: inline-block;
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .menu-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          color: #666;
          transition: color 0.3s;
        }

        .menu-btn:hover {
          color: #333;
        }

        .actions-menu {
          position: absolute;
          top: 3rem;
          right: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          overflow: hidden;
          z-index: 10;
          min-width: 160px;
        }

        .actions-menu button {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.9rem;
        }

        .actions-menu button:hover {
          background: #f5f5f5;
        }

        .actions-menu button.delete-btn {
          color: #f44336;
        }

        .actions-menu button.delete-btn:hover {
          background: #ffebee;
        }

        .card-body {
          border-top: 1px solid #f0f0f0;
          padding-top: 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item .label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .info-item .value {
          font-size: 1.1rem;
          color: #1a1a1a;
          font-weight: 600;
        }

        .description {
          margin: 0.75rem 0 0 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }

        .inactive-badge {
          margin-top: 0.75rem;
          padding: 0.5rem;
          background: #fff3cd;
          color: #856404;
          border-radius: 6px;
          font-size: 0.85rem;
          text-align: center;
          font-weight: 600;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .local-card {
            padding: 1rem;
          }

          .icon {
            font-size: 1.75rem;
          }

          .card-title h4 {
            font-size: 1rem;
          }

          .actions-menu {
            right: 0.5rem;
          }

          .actions-menu button {
            padding: 0.875rem 1rem;
            font-size: 1rem;
            min-height: 48px; /* Taille tactile recommandée */
          }

          .info-grid {
            gap: 0.75rem;
          }
        }

        /* Amélioration tactile */
        @media (hover: none) and (pointer: coarse) {
          .menu-btn {
            padding: 0.5rem 0.75rem;
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
