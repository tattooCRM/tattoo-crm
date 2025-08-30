import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Charger les conversations depuis le backend
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await chatAPI.getConversations();
      
      // Les données sont dans data.conversations ou directement dans data
      const conversationsList = data.conversations || data || [];
      
      // Transformer les données pour le frontend
      const transformedConversations = conversationsList.map(conv => {
        
        // Les participants sont déjà dans le bon format depuis le backend
        const clientParticipant = conv.participants?.find(p => p.role === 'client');
        const artistParticipant = conv.participants?.find(p => p.role === 'tattoo_artist');
        
        return {
          id: conv.id || conv._id,
          // Utiliser les informations déjà formatées par le backend
          otherParticipantName: conv.otherParticipantName || 'Participant',
          otherParticipantAvatar: conv.otherParticipantAvatar || 'U',
          otherParticipantRole: conv.otherParticipantRole,
          
          // Informations du client (pour compatibilité)
          clientId: clientParticipant?.userId?._id || clientParticipant?.userId,
          clientName: conv.otherParticipantRole === 'client' ? conv.otherParticipantName : 'Client',
          clientAvatar: conv.otherParticipantRole === 'client' ? conv.otherParticipantAvatar : 'C',
          
          // Informations du tatoueur (pour compatibilité)
          artistId: artistParticipant?.userId?._id || artistParticipant?.userId,
          artistName: conv.otherParticipantRole === 'tattoo_artist' ? conv.otherParticipantName : 'Tatoueur',
          artistAvatar: conv.otherParticipantRole === 'tattoo_artist' ? conv.otherParticipantAvatar : 'T',
          
          // Informations générales
          lastMessage: conv.lastMessage || 'Nouvelle conversation',
          lastMessageTime: conv.lastMessageTime || conv.lastActivity,
          unreadCount: conv.unreadCount || 0,
          projectType: conv.projectType || 'autre',
          specialty: conv.specialty || 'Tatouage personnalisé',
          isActive: conv.isActive,
          participants: conv.participants // Garder la structure complète
        };
      });
      
      setConversations(transformedConversations);
      
      // Calculer le nombre total de messages non lus
      const totalUnread = transformedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('❌ Erreur chargement conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Charger le nombre de messages non lus
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const data = await chatAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Erreur chargement messages non lus:', err);
    }
  }, [user, isAuthenticated]);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await chatAPI.markAsRead(conversationId);
      
      // Mettre à jour l'état local
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId && conv.unreadCount > 0) {
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

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      throw new Error('ID de conversation manquant');
    }
    
    try {
      const response = await chatAPI.getMessages(conversationId);
      
      // Vérifier si la réponse contient bien des messages
      if (!response || !Array.isArray(response)) {
        throw new Error('Format de réponse invalide');
      }
      
      return response;
    } catch (err) {
      console.error('❌ Erreur chargement messages:', err);
      console.error('Details:', {
        conversationId,
        errorMessage: err.message,
        stack: err.stack
      });
      setError(err.message);
      throw err;
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const message = await chatAPI.sendMessage(conversationId, content);
      
      // Mettre à jour la conversation locale avec le dernier message
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: message.content,
            lastMessageTime: message.createdAt
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

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [loadConversations, loadUnreadCount, isAuthenticated, user]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    markConversationAsRead,
    sendMessage,
    loadConversations,
    loadMessages
  };
};
