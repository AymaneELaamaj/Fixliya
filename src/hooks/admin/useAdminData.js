import { useState, useEffect, useCallback } from 'react';
import {
  getAllTickets,
  getArtisans,
  assignTicket,
  updateArtisan,
  deleteArtisan,
  getStatistics,
  getStudents,
  toggleStudentStatus,
  getExternalProviders,
  externalizeTicket,
  createArtisanAccount
} from '../../services/adminService';

export function useAdminData() {
  const [data, setData] = useState({
    tickets: [],
    artisans: [],
    externalProviders: [],
    statistics: null,
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement initial des données
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ticketsData, artisansData, statsData, studentsData, providersData] = await Promise.all([
        getAllTickets(),
        getArtisans(),
        getStatistics(),
        getStudents(),
        getExternalProviders()
      ]);

      // Trier les tickets par urgence
      const sortedTickets = ticketsData.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));

      setData({
        tickets: sortedTickets,
        artisans: artisansData,
        externalProviders: providersData,
        statistics: statsData,
        students: studentsData
      });
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Actions sur les tickets
  const handleAssignTicket = useCallback(async (ticketId, artisanId) => {
    const ticket = data.tickets.find(t => t.id === ticketId);
    if (ticket?.status === 'cancelled') {
      throw new Error("Ce ticket a été annulé. Vous ne pouvez pas l'assigner.");
    }

    const selectedArtisan = data.artisans.find(a => a.id === artisanId);
    if (!selectedArtisan) {
      throw new Error("Artisan non trouvé");
    }

    // Mise à jour optimiste (immédiate dans l'UI)
    setData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t =>
        t.id === ticketId
          ? { ...t, status: 'in_progress', assignedToName: selectedArtisan.prenom, assignedToId: artisanId }
          : t
      )
    }));

    try {
      // Ensuite mise à jour Firebase
      await assignTicket(ticketId, artisanId, selectedArtisan.prenom);
      return selectedArtisan;
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setData(prev => ({
        ...prev,
        tickets: prev.tickets.map(t =>
          t.id === ticketId ? ticket : t
        )
      }));
      
      // Gérer les erreurs réseau spécifiquement
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        throw new Error('Erreur réseau : Vérifiez votre connexion internet');
      }
      throw error;
    }
  }, [data.tickets, data.artisans]);

  const handleExternalizeTicket = useCallback(async (ticketId, providerId) => {
    const selectedProvider = data.externalProviders.find(p => p.id === providerId);
    if (!selectedProvider) {
      throw new Error("Prestataire non trouvé");
    }

    await externalizeTicket(ticketId, providerId, {
      name: selectedProvider.name,
      phone: selectedProvider.phone,
      email: selectedProvider.email
    });

    setData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'externalized',
              isExternalized: true,
              externalizedToName: selectedProvider.name,
              assignedToName: null,
              assignedToId: null
            }
          : t
      )
    }));

    return selectedProvider;
  }, [data.externalProviders]);

  // Actions sur les artisans
  const handleUpdateArtisan = useCallback(async (artisanId, formData) => {
    await updateArtisan(artisanId, formData);

    setData(prev => ({
      ...prev,
      artisans: prev.artisans.map(a =>
        a.id === artisanId ? { ...a, ...formData } : a
      )
    }));
  }, []);

  const handleDeleteArtisan = useCallback(async (artisanId) => {
    await deleteArtisan(artisanId);

    setData(prev => ({
      ...prev,
      artisans: prev.artisans.filter(a => a.id !== artisanId)
    }));
  }, []);

  const handleCreateArtisan = useCallback(async (artisanData) => {
    await createArtisanAccount(artisanData);
    const updatedArtisans = await getArtisans();

    setData(prev => ({
      ...prev,
      artisans: updatedArtisans
    }));
  }, []);

  // Actions sur les étudiants
  const handleToggleStudentStatus = useCallback(async (studentId, currentStatus) => {
    await toggleStudentStatus(studentId, currentStatus);

    setData(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.id === studentId ? { ...s, isActive: !s.isActive } : s
      )
    }));
  }, []);

  return {
    ...data,
    loading,
    error,
    refetch: fetchAllData,
    actions: {
      assignTicket: handleAssignTicket,
      externalizeTicket: handleExternalizeTicket,
      updateArtisan: handleUpdateArtisan,
      deleteArtisan: handleDeleteArtisan,
      createArtisan: handleCreateArtisan,
      toggleStudentStatus: handleToggleStudentStatus
    }
  };
}