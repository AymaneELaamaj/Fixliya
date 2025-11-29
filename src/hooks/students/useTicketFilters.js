import { useState, useMemo } from 'react';

/**
 * Hook pour gérer le filtrage et le tri des tickets
 */
export const useTicketFilters = (tickets) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tickets.map(t => t.category))];
    return uniqueCategories.sort();
  }, [tickets]);

  // Filtrer et trier les tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets];

    // Appliquer le filtre de statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Appliquer le filtre de catégorie
    if (filterCategory !== "all") {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Appliquer le tri
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "urgent") {
      filtered.sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
    }

    return filtered;
  }, [tickets, filterStatus, filterCategory, sortBy]);

  return {
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    categories,
    filteredAndSortedTickets
  };
};
