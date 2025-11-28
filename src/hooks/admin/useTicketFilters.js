import { useState, useMemo, useCallback } from 'react';

export function useTicketFilters(tickets) {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    urgent: 'all',
    sortBy: 'recent'
  });

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    return [...new Set(tickets.map(t => t.category).filter(Boolean))];
  }, [tickets]);

  // Appliquer les filtres et le tri
  const filteredTickets = useMemo(() => {
    let result = tickets.filter(ticket => {
      const statusMatch = filters.status === 'all' || ticket.status === filters.status;
      const categoryMatch = filters.category === 'all' || ticket.category === filters.category;
      const urgentMatch = filters.urgent === 'all' ||
        (filters.urgent === 'urgent' ? ticket.isUrgent : !ticket.isUrgent);

      return statusMatch && categoryMatch && urgentMatch;
    });

    // Tri
    if (filters.sortBy === 'urgent') {
      result = [...result].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
    } else if (filters.sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [tickets, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      category: 'all',
      urgent: 'all',
      sortBy: 'recent'
    });
  }, []);

  return {
    filters,
    filteredTickets,
    categories,
    updateFilter,
    resetFilters,
    ticketCount: filteredTickets.length
  };
}