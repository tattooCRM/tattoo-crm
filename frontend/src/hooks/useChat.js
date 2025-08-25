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
      
      // Transformer les données pour le frontend
      const transformedConversations = data.map(conv => {
        // Récupérer les participants
        const clientParticipant = conv.participants.find(p => p.role === 'client');
        const artistParticipant = conv.participants.find(p => p.role === 'tattoo_artist');
        
        return {
          id: conv._id,
          // Informations du client
          clientId: clientParticipant?.userId._id,
          clientName: clientParticipant?.userId.username || 
                     `${clientParticipant?.userId.prenom || ''} ${clientParticipant?.userId.nom || ''}`.trim() ||
                     clientParticipant?.userId.email || 'Client',
          clientAvatar: (clientParticipant?.userId.username?.[0] || 
                        clientParticipant?.userId.nom?.[0] || 
                        clientParticipant?.userId.email?.[0] || 'C').toUpperCase(),
          
          // Informations du tatoueur
          artistId: artistParticipant?.userId._id,
          artistName: artistParticipant?.userId.username || 
                     `${artistParticipant?.userId.prenom || ''} ${artistParticipant?.userId.nom || ''}`.trim() ||
                     artistParticipant?.userId.email || 'Tatoueur',
          artistAvatar: (artistParticipant?.userId.username?.[0] || 
                        artistParticipant?.userId.nom?.[0] || 
                        artistParticipant?.userId.email?.[0] || 'T').toUpperCase(),
          
          // Nom de l'autre participant (calculé par le backend)
          otherParticipantName: conv.otherParticipantName || 'Participant',
          otherParticipantAvatar: conv.otherParticipantAvatar || 'U',
          otherParticipantRole: conv.otherParticipantRole,
          
          // Informations générales
          lastMessage: conv.lastMessage?.content || 'Nouvelle conversation',
          lastMessageTime: conv.lastActivity || conv.createdAt,
          unreadCount: conv.unreadCount || 0,
          isOnline: Math.random() > 0.5, // Simulé pour le moment
          projectType: conv.projectType || 'autre',
          specialty: conv.specialty || 'Tatouage personnalisé',
          isActive: conv.isActive
        };
      });
      
      setConversations(transformedConversations);
      
      // Calculer le nombre total de messages non lus
      const totalUnread = transformedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
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
    try {
      const messages = await chatAPI.getMessages(conversationId);
      return messages;
    } catch (err) {
      console.error('Erreur chargement messages:', err);
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
