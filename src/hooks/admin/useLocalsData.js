// src/hooks/admin/useLocalsData.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllLocals, 
  getBuildings, 
  getCommonAreas,
  createLocal, 
  updateLocal, 
  deleteLocal,
  toggleLocalStatus,
  validateLocalData
} from '../../services/localService';

/**
 * Hook personnalisé pour gérer les données des locaux (Admin)
 */
export const useLocalsData = () => {
  const [locals, setLocals] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [commonAreas, setCommonAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données initiales
  const fetchLocals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allLocals, buildingsList, commonAreasList] = await Promise.all([
        getAllLocals(),
        getBuildings(),
        getCommonAreas()
      ]);
      
      setLocals(allLocals);
      setBuildings(buildingsList);
      setCommonAreas(commonAreasList);
    } catch (err) {
      console.error("Erreur chargement locaux:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocals();
  }, [fetchLocals]);

  // Actions
  const actions = {
    // Créer un nouveau local
    createLocal: async (localData) => {
      try {
        const validation = validateLocalData(localData);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors).join(', '));
        }

        const newLocal = await createLocal(localData);
        setLocals(prev => [...prev, newLocal]);
        
        // Mettre à jour la liste appropriée
        if (newLocal.type === 'building') {
          setBuildings(prev => [...prev, newLocal]);
        } else {
          setCommonAreas(prev => [...prev, newLocal]);
        }
        
        return newLocal;
      } catch (err) {
        console.error("Erreur création local:", err);
        throw err;
      }
    },

    // Mettre à jour un local
    updateLocal: async (localId, localData) => {
      try {
        const validation = validateLocalData(localData);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors).join(', '));
        }

        const updatedLocal = await updateLocal(localId, localData);
        
        setLocals(prev => 
          prev.map(local => local.id === localId ? { ...local, ...updatedLocal } : local)
        );
        
        // Mettre à jour la liste appropriée
        if (updatedLocal.type === 'building') {
          setBuildings(prev => 
            prev.map(b => b.id === localId ? { ...b, ...updatedLocal } : b)
          );
        } else {
          setCommonAreas(prev => 
            prev.map(c => c.id === localId ? { ...c, ...updatedLocal } : c)
          );
        }
        
        return updatedLocal;
      } catch (err) {
        console.error("Erreur mise à jour local:", err);
        throw err;
      }
    },

    // Supprimer un local
    deleteLocal: async (localId) => {
      try {
        await deleteLocal(localId);
        
        setLocals(prev => prev.filter(local => local.id !== localId));
        setBuildings(prev => prev.filter(b => b.id !== localId));
        setCommonAreas(prev => prev.filter(c => c.id !== localId));
      } catch (err) {
        console.error("Erreur suppression local:", err);
        throw err;
      }
    },

    // Activer/Désactiver un local
    toggleLocalStatus: async (localId, isActive) => {
      try {
        await toggleLocalStatus(localId, isActive);
        
        const updateStatus = (local) => 
          local.id === localId ? { ...local, isActive } : local;
        
        setLocals(prev => prev.map(updateStatus));
        setBuildings(prev => prev.map(updateStatus));
        setCommonAreas(prev => prev.map(updateStatus));
      } catch (err) {
        console.error("Erreur changement statut:", err);
        throw err;
      }
    },

    // Rafraîchir les données
    refresh: fetchLocals
  };

  return {
    locals,
    buildings,
    commonAreas,
    loading,
    error,
    actions
  };
};
