import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getMyMissions, getArtisanHistory } from '../../services/artisanService';

/**
 * Hook pour charger les données de l'artisan (missions et historique)
 */
export const useArtisanData = (navigate) => {
  const [missions, setMissions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      const todoData = await getMyMissions(uid);
      setMissions(todoData);
      const historyData = await getArtisanHistory(uid);
      setHistory(historyData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadData(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return {
    missions,
    history,
    loading,
    loadData
  };
};
