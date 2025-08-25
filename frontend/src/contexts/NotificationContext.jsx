import React, { createContext, useContext, useState } from 'react';

// Créer le contexte pour les notifications
const NotificationContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider pour les notifications
export const NotificationProvider = ({ children }) => {
  const [agendaBadgeCount, setAgendaBadgeCount] = useState(0);

  const updateAgendaBadge = (count) => {
    setAgendaBadgeCount(count);
  };

  return (
    <NotificationContext.Provider value={{
      agendaBadgeCount,
      updateAgendaBadge,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
