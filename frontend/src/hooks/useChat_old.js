import { useState, useEffect, useCallback } from 'react';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Données de démonstration pour éviter les erreurs API
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockConversations = [
        {
          id: 'demo_1',
          artistId: 'artist_1',
          artistName: 'Alex Tattoo',
          artistAvatar: 'AT',
          lastMessage: 'Bonjour ! Comment puis-je vous aider avec votre projet de tatouage ?',
          lastMessageTime: new Date(Date.now() - 1800000),
          unreadCount: 2,
          isOnline: true,
          specialty: 'Traditionnel, Réalisme'
        },
        {
          id: 'demo_2', 
          artistId: 'artist_2',
          artistName: 'Sophie Chen',
          artistAvatar: 'SC',
          lastMessage: 'J\'ai quelques idées pour votre design japonais.',
          lastMessageTime: new Date(Date.now() - 3600000),
          unreadCount: 1,
          isOnline: false,
          specialty: 'Japonais, Oriental'
        },
        {
          id: 'demo_3',
          artistId: 'artist_3',
          artistName: 'Marie Dubois',
          artistAvatar: 'MD',
          lastMessage: 'Parfait ! J\'adore les designs géométriques.',
          lastMessageTime: new Date(Date.now() - 7200000),
          unreadCount: 0,
          isOnline: true,
          specialty: 'Géométrique, Minimaliste'
        }
      ];
      setConversations(mockConversations);
      setUnreadCount(3);
      setLoading(false);
    }, 500);
  }, []);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId && conv.unreadCount > 0) {
        setUnreadCount(current => current - conv.unreadCount);
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  }, []);

  // Envoyer un message (simulation)
  const sendMessage = useCallback(async (conversationId, content) => {
    console.log('Envoi message:', conversationId, content);
    // Simulation d'envoi réussi
    return Promise.resolve({ 
      id: Date.now(),
      content,
      timestamp: new Date()
    });
  }, []);

  // Charger les conversations (déjà fait dans useEffect)
  const loadConversations = useCallback(() => {
    // Déjà chargées
  }, []);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    markConversationAsRead,
    sendMessage,
    loadConversations
  };
};

  // Charger les conversations depuis l'API
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getConversations();
      setConversations(data.conversations || []);
      setUnreadCount(data.totalUnread || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError(err.message);
      // Fallback sur des données de démonstration en cas d'erreur
      const mockConversations = [
        {
          id: 'demo_1',
          artistId: 'artist_1',
          artistName: 'Alex Tattoo',
          artistAvatar: 'AT',
          lastMessage: 'Bonjour ! Comment puis-je vous aider avec votre projet de tatouage ?',
          lastMessageTime: new Date(Date.now() - 1800000),
          unreadCount: 2,
          isOnline: true,
          specialty: 'Traditionnel, Réalisme'
        },
        {
          id: 'demo_2', 
          artistId: 'artist_2',
          artistName: 'Sophie Chen',
          artistAvatar: 'SC',
          lastMessage: 'J\'ai quelques idées pour votre design japonais.',
          lastMessageTime: new Date(Date.now() - 3600000),
          unreadCount: 1,
          isOnline: false,
          specialty: 'Japonais, Oriental'
        }
      ];
      setConversations(mockConversations);
      setUnreadCount(3);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Rafraîchir périodiquement le compteur de messages non lus
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await chatAPI.getUnreadCount();
        if (data.unreadCount !== unreadCount) {
          setUnreadCount(data.unreadCount);
          if (data.unreadCount > unreadCount) {
            addSystemNotification(
              'Nouveaux messages', 
              `Vous avez ${data.unreadCount - unreadCount} nouveau(x) message(s)`,
              'info'
            );
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des messages:', err);
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [unreadCount, addSystemNotification]);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await chatAPI.markAsRead(conversationId);
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversationId && conv.unreadCount > 0) {
          setUnreadCount(current => current - conv.unreadCount);
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      addSystemNotification('Erreur', 'Impossible de marquer comme lu', 'error');
    }
  }, [addSystemNotification]);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const message = await chatAPI.sendMessage(conversationId, content);
      
      // Mettre à jour la conversation localement
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? {
              ...conv,
              lastMessage: message,
              lastMessageTime: new Date()
            }
          : conv
      ));

      return message;
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      addSystemNotification('Erreur', 'Impossible d\'envoyer le message', 'error');
      throw err;
    }
  }, [addSystemNotification]);

  // Créer une nouvelle conversation avec un tatoueur
  const createConversation = useCallback(async (tattooArtistId) => {
    try {
      setLoading(true);
      const conversation = await chatAPI.createConversation(tattooArtistId);
      setConversations(prev => [conversation, ...prev]);
      addSystemNotification('Succès', 'Conversation créée', 'success');
      return conversation;
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err);
      addSystemNotification('Erreur', 'Impossible de créer la conversation', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addSystemNotification]);

  // Récupérer les tatoueurs disponibles
  const getTattooArtists = useCallback(async () => {
    try {
      return await chatAPI.getTattooArtists();
    } catch (err) {
      console.error('Erreur lors de la récupération des tatoueurs:', err);
      addSystemNotification('Erreur', 'Impossible de charger les tatoueurs', 'error');
      return [];
    }
  }, [addSystemNotification]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    markConversationAsRead,
    sendMessage,
    createConversation,
    getTattooArtists,
    refreshConversations: loadConversations
  };
};
