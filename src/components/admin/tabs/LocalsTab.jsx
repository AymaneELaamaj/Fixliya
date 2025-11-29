// src/components/admin/tabs/LocalsTab.jsx
import React, { useState } from 'react';
import { useLocalsData } from '../../../hooks/admin/useLocalsData';
import LocalCard from '../cards/LocalCard';
import LocalForm from '../forms/LocalForm';
import { LOCAL_TYPES } from '../../../services/localService';

/**
 * Onglet de gestion des locaux pour l'administrateur
 * Optimisé pour mobile avec design responsive
 */
export default function LocalsTab() {
  const { locals, buildings, commonAreas, loading, error, actions } = useLocalsData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'buildings', 'common_areas'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage des locaux
  const filteredLocals = locals.filter(local => {
    // Filtre par type
    if (filter === 'buildings' && local.type !== LOCAL_TYPES.BUILDING) return false;
    if (filter === 'common_areas' && local.type !== LOCAL_TYPES.COMMON_AREA) return false;
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        local.name.toLowerCase().includes(query) ||
        local.description?.toLowerCase().includes(query) ||
        local.category?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handlers
  const handleCreate = async (localData) => {
    try {
      await actions.createLocal(localData);
      setShowForm(false);
    } catch (error) {
      console.error("Erreur création:", error);
      throw error;
    }
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    setShowForm(true);
  };

  const handleUpdate = async (localData) => {
    try {
      await actions.updateLocal(editingLocal.id, localData);
      setShowForm(false);
      setEditingLocal(null);
    } catch (error) {
      console.error("Erreur modification:", error);
      throw error;
    }
  };

  const handleDelete = async (localId) => {
    try {
      await actions.deleteLocal(localId);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleToggleStatus = async (localId, isActive) => {
    try {
      await actions.toggleLocalStatus(localId, isActive);
    } catch (error) {
      console.error("Erreur changement statut:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocal(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des locaux...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ Erreur: {error}</p>
        <button onClick={actions.refresh} className="btn btn-primary">
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="locals-tab">
      {/* En-tête avec statistiques */}
      <div className="tab-header">
        <div className="header-content">
          <h2>🏢 Gestion des Locaux</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-value">{buildings.length}</span>
              <span className="stat-label">Bâtiments</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{commonAreas.length}</span>
              <span className="stat-label">Espaces Communs</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{locals.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
        
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary btn-add"
          >
            ➕ Nouveau Local
          </button>
        )}
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="form-container">
          <LocalForm
            onSubmit={editingLocal ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            initialData={editingLocal}
            isEdit={!!editingLocal}
          />
        </div>
      )}

      {/* Filtres et recherche */}
      {!showForm && (
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Rechercher un local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Tous ({locals.length})
            </button>
            <button
              className={filter === 'buildings' ? 'active' : ''}
              onClick={() => setFilter('buildings')}
            >
              🏢 Bâtiments ({buildings.length})
            </button>
            <button
              className={filter === 'common_areas' ? 'active' : ''}
              onClick={() => setFilter('common_areas')}
            >
              🏛️ Espaces Communs ({commonAreas.length})
            </button>
          </div>
        </div>
      )}

      {/* Liste des locaux */}
      {!showForm && (
        <div className="locals-list">
          {filteredLocals.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <h3>Aucun local trouvé</h3>
              <p>
                {searchQuery 
                  ? 'Essayez une autre recherche'
                  : 'Commencez par créer votre premier local'
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setShowForm(true)} 
                  className="btn btn-primary"
                >
                  ➕ Créer un local
                </button>
              )}
            </div>
          ) : (
            <div className="locals-grid">
              {filteredLocals.map(local => (
                <LocalCard
                  key={local.id}
                  local={local}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .locals-tab {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .header-content h2 {
          margin: 0 0 1rem 0;
          color: #1a1a1a;
          font-size: 1.75rem;
        }

        .stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #4CAF50;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .btn-add {
          white-space: nowrap;
          min-width: 180px;
        }

        .form-container {
          margin-bottom: 2rem;
        }

        .filters-section {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .filter-tabs button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
          white-space: nowrap;
        }

        .filter-tabs button:hover {
          border-color: #4CAF50;
          background: #f1f8f4;
        }

        .filter-tabs button.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .locals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #1a1a1a;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-primary:hover {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .locals-tab {
            padding: 1rem;
          }

          .tab-header {
            flex-direction: column;
          }

          .header-content h2 {
            font-size: 1.5rem;
          }

          .stats {
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .stat-item {
            flex: 1;
            min-width: 100px;
            padding: 0.5rem 0.75rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .btn-add {
            width: 100%;
          }

          .locals-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs::-webkit-scrollbar {
            height: 4px;
          }

          .filter-tabs::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 2px;
          }
        }

        /* Amélioration tactile pour mobile */
        @media (hover: none) and (pointer: coarse) {
          .filter-tabs button {
            min-height: 48px;
            padding: 0.875rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
