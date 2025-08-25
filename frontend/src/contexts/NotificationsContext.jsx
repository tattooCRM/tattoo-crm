import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationsContext = createContext();

export const useNotificationsSystem = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsSystem must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  // Charger les notifications depuis localStorage au démarrage
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved).map(n => ({...n, createdAt: new Date(n.createdAt)})) : [];
  });

  // Ajouter notification de bienvenue au premier démarrage
  useEffect(() => {
    const hasWelcome = localStorage.getItem('hasWelcomeNotification');
    if (!hasWelcome) {
      addNotification({
        type: 'welcome',
        title: '🎉 Bienvenue dans votre espace InkFlow !',
        message: 'Gérez vos rendez-vous, clients et plus encore en toute simplicité.',
        icon: '✨'
      });
      localStorage.setItem('hasWelcomeNotification', 'true');
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Nettoyage automatique des notifications anciennes (plus de 7 jours)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      setNotifications(prev => {
        const cleaned = prev.filter(n => n.createdAt > sevenDaysAgo);
        if (cleaned.length !== prev.length) {
          console.log(`🧹 ${prev.length - cleaned.length} notifications anciennes supprimées`);
        }
        return cleaned;
      });
    }, 60 * 60 * 1000); // Vérifier chaque heure

    return () => clearInterval(cleanupInterval);
  }, []);

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      time: 'à l\'instant',
      isRead: false,
      createdAt: new Date(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Effacer toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notifications spécifiques pour l'agenda
  const addEventCreatedNotification = useCallback((eventTitle, eventDate, eventTime) => {
    const title = eventTitle || 'Événement';
    const date = eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : 'une date inconnue';
    const time = eventTime || 'une heure inconnue';
    
    addNotification({
      type: 'event_created',
      title: '✅ Événement créé',
      message: `"${title}" programmé le ${date} à ${time}`,
      icon: '📅'
    });
  }, [addNotification]);

  const addEventUpdatedNotification = useCallback((eventTitle, eventDate, eventTime) => {
    const title = eventTitle || 'Événement';
    const date = eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : 'une date inconnue';
    const time = eventTime || 'une heure inconnue';
    
    addNotification({
      type: 'event_updated',
      title: '📝 Événement modifié',
      message: `"${title}" reprogrammé le ${date} à ${time}`,
      icon: '✏️'
    });
  }, [addNotification]);

  const addEventDeletedNotification = useCallback((eventTitle) => {
    const title = eventTitle || 'Événement';
    
    addNotification({
      type: 'event_deleted',
      title: '🗑️ Événement supprimé',
      message: `"${title}" a été supprimé de votre agenda`,
      icon: '❌'
    });
  }, [addNotification]);

  const addEventMovedNotification = useCallback((eventTitle, newDate, newTime) => {
    // Vérifier que les valeurs sont définies
    const title = eventTitle || 'Événement';
    const date = newDate ? new Date(newDate).toLocaleDateString('fr-FR') : 'une date inconnue';
    const time = newTime || 'une heure inconnue';
    
    addNotification({
      type: 'event_moved',
      title: '📍 Événement déplacé',
      message: `"${title}" déplacé au ${date} à ${time}`,
      icon: '🔄'
    });
  }, [addNotification]);

  // Notifications pour les clients
  const addClientCreatedNotification = useCallback((clientName) => {
    addNotification({
      type: 'client_created',
      title: '👤 Nouveau client',
      message: `${clientName} a été ajouté à votre liste de clients`,
      icon: '✨'
    });
  }, [addNotification]);

  const addClientUpdatedNotification = useCallback((clientName) => {
    addNotification({
      type: 'client_updated',
      title: '� Client modifié',
      message: `Les informations de ${clientName} ont été mises à jour`,
      icon: '📝'
    });
  }, [addNotification]);

  // Notifications système
  const addSystemNotification = useCallback((title, message, type = 'info') => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    addNotification({
      type: `system_${type}`,
      title: `${icons[type]} ${title}`,
      message,
      icon: icons[type]
    });
  }, [addNotification]);

  // Notifications de sauvegarde
  const addBackupNotification = useCallback((success = true) => {
    addNotification({
      type: 'backup',
      title: success ? '💾 Sauvegarde réussie' : '💾 Échec de sauvegarde',
      message: success 
        ? 'Vos données ont été sauvegardées avec succès' 
        : 'Erreur lors de la sauvegarde automatique',
      icon: success ? '✅' : '❌'
    });
  }, [addNotification]);

  // Calculer le temps relatif
  const getRelativeTime = useCallback((createdAt) => {
    const now = new Date();
    const diff = now - createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'à l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return createdAt.toLocaleDateString('fr-FR');
  }, []);

  // Mettre à jour les temps relatifs
  const getNotificationsWithRelativeTime = useCallback(() => {
    return notifications.map(n => ({
      ...n,
      time: getRelativeTime(n.createdAt)
    }));
  }, [notifications, getRelativeTime]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications: getNotificationsWithRelativeTime(),
    unreadCount,
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAll,
    // Fonctions spécifiques agenda
    addEventCreatedNotification,
    addEventUpdatedNotification,
    addEventDeletedNotification,
    addEventMovedNotification,
    // Fonctions spécifiques clients
    addClientCreatedNotification,
    addClientUpdatedNotification,
    // Fonctions système
    addSystemNotification,
    addBackupNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
