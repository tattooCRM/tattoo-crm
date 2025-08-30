import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft, Search, Plus, MoreVertical, Send, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ProjectMessage from '../components/ProjectMessage';
import QuoteModal from '../../components/QuoteModal';
import QuoteMessage from '../../components/QuoteMessage';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [pendingConversationId, setPendingConversationId] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    conversations, 
    loading, 
    error, 
    sendMessage: sendChatMessage, 
    markConversationAsRead,
    loadConversations,
    loadMessages
  } = useChat();

  // Définir handleSelectChat AVANT les useEffect qui l'utilisent
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      // Charger les messages réels de la conversation
      const realMessages = await loadMessages(chat.id);
      
      // Formatter les messages pour l'affichage
      const formattedMessages = realMessages.map(msg => {
        console.log('🔍 Debug formatting message:', {
          id: msg.id,
          type: msg.type,
          contentPreview: msg.content ? msg.content.substring(0, 50) + '...' : 'No content',
          contentType: typeof msg.content
        });
        
        let content = msg.content;
        
        // Si c'est un message projet et que le contenu est un objet, conserver l'objet
        if (msg.type === 'project' && typeof msg.content === 'object') {
          content = msg.content; // Garder l'objet pour le ProjectMessage component
        } else if (msg.type === 'project' && typeof msg.content === 'string') {
          // Si c'est déjà formaté en string, on peut essayer de le parser ou le laisser tel quel
          content = msg.content;
        }
        
        return {
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          content: content,
          timestamp: new Date(msg.timestamp),
          type: msg.type,
          metadata: msg.metadata // IMPORTANT: Conserver les métadonnées
        };
      });
      
      setMessages(formattedMessages);
      
      // Marquer comme lu
      if (chat.unreadCount > 0) {
        await markConversationAsRead(chat.id);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du chat:', error);
      console.error('Détails de l\'erreur:', {
        chatId: chat.id,
        chatName: chat.artistName || chat.clientName,
        errorMessage: error.message,
        stack: error.stack
      });
      
      // En cas d'erreur, afficher un message par défaut avec plus de détails
      setMessages([
        {
          id: 'error',
          senderId: 'system',
          senderName: 'Système',
          content: `❌ Erreur lors du chargement des messages: ${error.message}. Veuillez réessayer dans quelques instants.`,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }
  };

  // Gérer la conversation à ouvrir depuis la navigation
  useEffect(() => {
    if (location.state?.conversationId) {
      setPendingConversationId(location.state.conversationId);
      
      // Nettoyer le state de navigation pour éviter les boucles
      navigate('/chat', { replace: true });
      
      // Toujours recharger les conversations pour être sûr d'avoir la nouvelle
      loadConversations();
    }
  }, [location.state, navigate, loadConversations]);

  // Ouvrir la conversation une fois qu'elle est disponible
  useEffect(() => {
    if (pendingConversationId && conversations.length > 0) {
      console.log('Searching for conversation:', conversations.map(c => ({
        id: c.id, 
        name: c.otherParticipantName || c.artistName || c.clientName 
      })));
      
      const targetConversation = conversations.find(conv => 
        conv.id === pendingConversationId || conv.id?.toString() === pendingConversationId?.toString()
      );
      
      if (targetConversation) {
        setSelectedChat(targetConversation);
        
        // Charger et afficher les messages immédiatement
        handleSelectChat(targetConversation);
        
        // Réinitialiser l'ID en attente
        setPendingConversationId(null);
        
        // Afficher un message de succès si fourni
        if (location.state?.successMessage) {
          // Vous pouvez ajouter ici une notification toast si vous en avez une
        }
      } else {
        
        // Si la conversation n'est pas encore disponible, réessayer dans 2 secondes
        const retryTimer = setTimeout(() => {
          loadConversations();
        }, 2000);
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [conversations, pendingConversationId, loadConversations, location.state, handleSelectChat]);

  // Utilisation du hook useChat pour les données réelles

  // Gérer l'ouverture de la modal de devis
  useEffect(() => {
    const handleQuoteButtonClick = (event) => {
      if (event.target.classList.contains('quote-view-button')) {
        const quoteId = event.target.getAttribute('data-quote-id');
        setSelectedQuoteId(quoteId);
        setQuoteModalOpen(true);
      }
    };

    document.addEventListener('click', handleQuoteButtonClick);
    
    // Gestionnaire pour les messages PostMessage des boutons HTML
    const handlePostMessage = async (event) => {
      if (event.data && event.data.type === 'quote_action') {
        const { action, quoteId } = event.data;
        console.log('🎯 Action reçue via PostMessage:', { action, quoteId });
        
        try {
          const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              action: action === 'accept' ? 'accept_quote' : 'decline_quote',
              conversationId: selectedChat?.id
            })
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de l\'action sur le devis');
          }
          
          const result = await response.json();
          console.log('✅ Action réussie:', result);
          
          // Recharger les messages pour voir la mise à jour
          if (selectedChat) {
            handleSelectChat(selectedChat);
          }
          
        } catch (error) {
          console.error('❌ Erreur action devis:', error);
        }
      }
    };

    // Gestionnaire pour les événements personnalisés des boutons HTML
    const handleCustomEvent = async (event) => {
      const { action, quoteId } = event.detail;
      console.log('🎯 Action reçue via CustomEvent:', { action, quoteId });
      
      try {
        // Gérer l'action "Voir PDF" directement
        if (action === 'view_pdf') {
          window.open(`http://localhost:5000/api/quotes/${quoteId}/pdf`, '_blank');
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action: action === 'accept' ? 'accept_quote' : 'decline_quote',
            conversationId: selectedChat?.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'action sur le devis');
        }
        
        const result = await response.json();
        console.log('✅ Action réussie:', result);
        
        // Recharger les messages pour voir la mise à jour
        if (selectedChat) {
          handleSelectChat(selectedChat);
        }
        
      } catch (error) {
        console.error('❌ Erreur action devis:', error);
      }
    };
    
    window.addEventListener('message', handlePostMessage);
    window.addEventListener('quoteAction', handleCustomEvent);
    
    return () => {
      document.removeEventListener('click', handleQuoteButtonClick);
      window.removeEventListener('message', handlePostMessage);
    };
  }, [selectedChat]);

  const closeQuoteModal = () => {
    setQuoteModalOpen(false);
    setSelectedQuoteId(null);
    // Recharger les messages pour voir les changements de statut
    if (selectedChat) {
      handleSelectChat(selectedChat);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  // Gérer les actions des boutons de devis
  const handleQuoteButtonAction = async (button, quoteId) => {
    try {
      console.log('🎯 Action bouton devis:', { action: button.action, quoteId });
      
      // Pour les actions qui nécessitent une API call (accepter/refuser)
      if (button.action === 'accept_quote' || button.action === 'decline_quote') {
        const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action: button.action,
            conversationId: selectedChat?.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'action sur le devis');
        }
        
        const result = await response.json();
        console.log('✅ Action réussie:', result);
        
        // Recharger les messages pour voir la mise à jour
        if (selectedChat) {
          handleSelectChat(selectedChat);
        }
        
        // Afficher un message de confirmation
        if (result.responseMessage) {
          const confirmationMessage = {
            id: Date.now(),
            senderId: user?.id,
            senderName: user?.name || 'Vous',
            content: result.responseMessage,
            timestamp: new Date(),
            type: 'system'
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        }
      }
      
      // Note: Les actions view_quote et download_pdf sont gérées directement dans QuoteMessage
      
    } catch (error) {
      console.error('❌ Erreur action devis:', error);
      
      // Afficher un message d'erreur
      const errorMessage = {
        id: Date.now(),
        senderId: 'system',
        senderName: 'Système',
        content: `❌ Erreur: ${error.message}`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const messageToSend = message.trim();
    
    // Ajouter le message localement d'abord pour une UX fluide
    const tempMessage = {
      id: Date.now(),
      senderId: user?.id || 'client_1',
      senderName: user?.name || user?.email || 'Vous',
      content: messageToSend,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessage('');
    
    try {
      // Envoyer via l'API
      const sentMessage = await sendChatMessage(selectedChat.id, messageToSend);
      
      // Remplacer le message temporaire par le message envoyé réellement
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? {
          id: sentMessage.id,
          senderId: sentMessage.senderId,
          senderName: sentMessage.senderName,
          content: sentMessage.content,
          timestamp: new Date(sentMessage.timestamp),
          type: sentMessage.type
        } : msg
      ));

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Retirer le message temporaire de l'interface en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessage(messageToSend); // Remettre le message dans l'input
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Maintenant';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}j`;
    return messageTime.toLocaleDateString('fr-FR');
  };

  // Fonction pour formater les données du projet en message
  const formatProjectMessage = (projectData) => {
    const projectTypeLabels = {
      'first': 'Mon premier tatouage',
      'addition': 'Ajout à ma collection',
      'coverup': 'Cover-up',
      'rework': 'Retouche/Réparation'
    };

    const bodyZoneLabels = {
      'arm': 'Bras',
      'leg': 'Jambe',
      'back': 'Dos',
      'chest': 'Poitrine',
      'shoulder': 'Épaule',
      'wrist': 'Poignet',
      'ankle': 'Cheville',
      'neck': 'Nuque',
      'other': 'Autre'
    };

    const styleLabels = {
      'realistic': 'Réaliste',
      'traditional': 'Traditionnel',
      'geometric': 'Géométrique',
      'minimalist': 'Minimaliste',
      'blackwork': 'Blackwork',
      'watercolor': 'Aquarelle',
      'tribal': 'Tribal',
      'japanese': 'Japonais',
      'other': 'Autre'
    };

    const sizeLabels = {
      'small': 'Petit (< 5cm)',
      'medium': 'Moyen (5-15cm)',
      'large': 'Grand (15-30cm)',
      'xlarge': 'Très grand (> 30cm)'
    };

    const budgetLabels = {
      '0-100': '50€ - 100€',
      '100-200': '100€ - 200€',
      '200-500': '200€ - 500€',
      '500-1000': '500€ - 1000€',
      '1000+': '1000€+',
      'discuss': 'À discuter'
    };

    const availabilityLabels = {
      'flexible': 'Flexible',
      'weekdays': 'Semaine uniquement',
      'weekends': 'Week-ends uniquement',
      'evenings': 'Soirées',
      'asap': 'Dès que possible'
    };

    let formattedMessage = `🎨 **Nouvelle demande de projet**\n\n`;
    
    formattedMessage += `**Type de projet:** ${projectTypeLabels[projectData.projectType] || projectData.projectType}\n`;
    formattedMessage += `**Zone du corps:** ${bodyZoneLabels[projectData.bodyZone] || projectData.bodyZone}\n`;
    formattedMessage += `**Style souhaité:** ${styleLabels[projectData.style] || projectData.style}\n`;
    formattedMessage += `**Taille:** ${sizeLabels[projectData.size] || projectData.size}\n\n`;
    
    formattedMessage += `**Description du projet:**\n${projectData.description}\n\n`;
    
    if (projectData.budget) {
      formattedMessage += `**Budget approximatif:** ${budgetLabels[projectData.budget] || projectData.budget}\n`;
    }
    
    if (projectData.availability) {
      formattedMessage += `**Disponibilités:** ${availabilityLabels[projectData.availability] || projectData.availability}\n`;
    }

    if (projectData.isIntimate) {
      formattedMessage += `⚠️ **Zone intime:** Oui, des précautions particulières sont nécessaires\n`;
    }

    if (projectData.placementPhoto) {
      formattedMessage += `📸 **Photo de placement:** Fournie (aide pour adapter le stencil)\n`;
    }

    formattedMessage += `\n---\n*Demande envoyée le ${new Date(projectData.submittedAt).toLocaleDateString('fr-FR')} à ${new Date(projectData.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}*`;

    return formattedMessage;
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Header de navigation */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
            {user?.nom ? user.nom.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {user?.prenom || user?.nom || 'Client'}
          </span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)] max-w-6xl mx-auto bg-white shadow-lg">
        {/* Liste des conversations */}
        <div className={`${
          selectedChat ? 'hidden md:block' : 'block'
        } w-full md:w-80 border-r border-gray-200`}>
          
          {/* Header liste */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <Plus size={20} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un artiste..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chargement des conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs text-gray-400 mt-1">
                  Commencez par contacter un tatoueur
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectChat(conv)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                  selectedChat?.id === conv.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold">
                    {conv.otherParticipantAvatar || conv.artistAvatar || conv.clientAvatar}
                  </div>
                </div>

                {/* Infos conversation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.otherParticipantName || conv.artistName || conv.clientName}
                    </h3>
                    <div className="flex items-center gap-2">
                      {conv.unreadCount > 0 && (
                        <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conv.lastMessage}
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    {user?.role === 'client' ? `Spécialité: ${conv.specialty}` : 'Client'}
                  </p>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Info en bas - supprimé le status en ligne selon votre demande */}
        </div>

        {/* Interface de chat */}
        <div className={`${
          !selectedChat ? 'hidden md:block' : 'block'
        } flex-1 flex flex-col`}>
          {selectedChat ? (
            <>
              {/* Header du chat */}
              <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="p-2 hover:bg-gray-100 rounded-full md:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold">
                    {selectedChat.otherParticipantAvatar || selectedChat.artistAvatar || selectedChat.clientAvatar}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.otherParticipantName || selectedChat.artistName || selectedChat.clientName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'client' ? `Spécialité: ${selectedChat.specialty}` : 'Client'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Spécialité: {selectedChat.specialty}</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      {selectedChat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {selectedChat.unreadCount} non lus
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Dernière activité: {formatLastMessageTime(selectedChat.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.senderId === (user?.id || 'client_1');
                  const isProject = msg.type === 'project';
                  const isQuote = msg.type === 'quote';
                  const isSpecialMessage = isProject || isQuote;
                  
                  // Debug pour les messages de devis
                  if (msg.content && typeof msg.content === 'string' && msg.content.includes('<div')) {
                    console.log('🔍 Debug message:', {
                      type: msg.type,
                      isQuote,
                      isProject,
                      isSpecialMessage,
                      contentPreview: msg.content.substring(0, 100) + '...',
                      willRenderHTML: (isProject || isQuote) && typeof msg.content === 'string' && msg.content.includes('<div')
                    });
                  }
                  
                  // Debug log pour voir les types de messages
                  console.log('🔍 Debug message:', {
                    id: msg.id,
                    type: msg.type,
                    isProject,
                    isQuote,
                    isSpecialMessage,
                    contentType: typeof msg.content,
                    hasHTML: typeof msg.content === 'string' && msg.content.includes('<div'),
                    contentPreview: typeof msg.content === 'string' ? msg.content.substring(0, 100) + '...' : 'not string'
                  });
                  
                  if (isProject && typeof msg.content === 'object') {
                    // Utiliser le composant ProjectMessage pour les messages projet
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <ProjectMessage 
                          projectData={msg.content}
                          timestamp={msg.timestamp}
                          isOwn={isOwn}
                        />
                      </div>
                    );
                  }

                  // Messages de devis HTML stylés - PRIORITÉ MAXIMALE
                  if (isQuote && (msg.metadata?.messageType === 'html_quote' || 
                                  (typeof msg.content === 'string' && msg.content.includes('<div style')))) {
                    console.log('🎨 RENDU HTML DEVIS pour:', { 
                      id: msg.id, 
                      type: msg.type, 
                      messageType: msg.metadata?.messageType,
                      preview: msg.content.substring(0, 50) 
                    });
                    return (
                      <div key={msg.id} className="flex justify-center w-full">
                        <div 
                          dangerouslySetInnerHTML={{ __html: msg.content }}
                          className="quote-html-message w-full max-w-md"
                        />
                      </div>
                    );
                  }

                  // Messages de devis avec boutons interactifs (ancien format)
                  if (isQuote && msg.metadata?.messageType === 'interactive_quote') {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <QuoteMessage
                          message={msg}
                          isOwn={isOwn}
                          currentUserId={user?.id}
                          onButtonClick={handleQuoteButtonAction}
                        />
                      </div>
                    );
                  }
                  
                  // Messages texte normaux
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${
                        isSpecialMessage 
                          ? 'max-w-full' // Messages projet et devis prennent plus de place
                          : 'max-w-xs lg:max-w-md'
                      } ${
                        isSpecialMessage
                          ? '' // Pas de style par défaut pour les messages projet et devis
                          : `px-4 py-3 rounded-2xl ${
                              isOwn 
                                ? 'bg-black text-white rounded-br-sm' 
                                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border'
                            }`
                      }`}>
                        {!isOwn && !isSpecialMessage && (
                          <p className="text-xs font-semibold mb-2 text-gray-600">
                            {msg.senderName}
                          </p>
                        )}
                        
                        {isProject && typeof msg.content === 'string' && msg.content.includes('<div') ? (
                          // Rendu HTML seulement pour les messages projet (les devis sont gérés plus haut)
                          <div 
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                            className="project-message"
                          />
                        ) : (
                          <div>
                            <p className={isSpecialMessage ? "text-sm leading-relaxed whitespace-pre-wrap" : "text-sm leading-relaxed"}>
                              {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                            </p>
                          </div>
                        )}
                        
                        {!isSpecialMessage && (
                          <p className={`text-xs mt-2 ${
                            isOwn ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    <Paperclip size={18} />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Smile size={16} className="text-gray-600" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-colors ${
                      message.trim() 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // État vide - pas de chat sélectionné
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={64} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-sm text-center max-w-sm">
                Choisissez un artiste tatoueur dans la liste pour commencer à discuter de votre projet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de devis */}
      {quoteModalOpen && (
        <QuoteModal 
          isOpen={quoteModalOpen}
          onClose={closeQuoteModal}
          quoteId={selectedQuoteId}
          userId={user?.id}
        />
      )}
    </div>
  );
}
