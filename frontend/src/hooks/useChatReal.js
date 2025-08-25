import { useState, useEffect, useCallback, useContext } from 'react';
import { chatAPI } from '../services/chatAPI';
import { AuthContext } from '../contexts/AuthContext';

export const useChatReal = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await chatAPI.getConversations();
      setConversations(data);
      
      // Calculer le nombre total de messages non lus
      const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger le nombre de messages non lus
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await chatAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Erreur chargement messages non lus:', err);
    }
  }, [user]);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await chatAPI.markAsRead(conversationId);
      
      // Mettre à jour l'état local
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversationId && conv.unreadCount > 0) {
          const unreadToSubtract = conv.unreadCount;
          setUnreadCount(current => Math.max(0, current - unreadToSubtract));
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Erreur marquage lecture:', err);
      setError(err.message);
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const message = await chatAPI.sendMessage(conversationId, content);
      
      // Mettre à jour la conversation locale avec le dernier message
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            lastMessage: message,
            lastActivity: new Date()
          };
        }
        return conv;
      }));
      
      return message;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Créer une nouvelle conversation
  const createConversation = useCallback(async (tattooArtistId, projectType = 'autre') => {
    try {
      const conversation = await chatAPI.createConversation(tattooArtistId, projectType);
      
      // Ajouter la nouvelle conversation à la liste
      setConversations(prev => [conversation, ...prev]);
      
      return conversation;
    } catch (err) {
      console.error('Erreur création conversation:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Récupérer les messages d'une conversation
  const getMessages = useCallback(async (conversationId) => {
    try {
      return await chatAPI.getMessages(conversationId);
    } catch (err) {
      console.error('Erreur récupération messages:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Récupérer les tatoueurs disponibles
  const getTattooArtists = useCallback(async () => {
    try {
      return await chatAPI.getTattooArtists();
    } catch (err) {
      console.error('Erreur récupération tatoueurs:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [loadConversations, loadUnreadCount]);

  // Polling pour les messages en temps réel (optionnel)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    markConversationAsRead,
    sendMessage,
    loadConversations,
    createConversation,
    getMessages,
    getTattooArtists,
    loadUnreadCount
  };
};
