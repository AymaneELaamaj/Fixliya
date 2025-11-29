import { useState } from 'react';

/**
 * Hook pour gérer les onglets (todo/history)
 */
export const useTabs = (initialTab = 'todo') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return {
    activeTab,
    setActiveTab
  };
};
