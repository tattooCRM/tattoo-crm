import React, { useState, useEffect } from 'react';
import ChatList from '../../assets/components/ChatList';
import { MessageCircle, Star, ArrowLeft, Send, Paperclip, Smile, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { useNavigate } from 'react-router-dom';
import ProjectMessage from '../components/ProjectMessage';
import QuoteEditor from '../../components/QuoteEditor';

export default function TattooArtistChat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile] = useState(window.innerWidth < 768);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showQuoteEditor, setShowQuoteEditor] = useState(false);
  const { user } = useAuth();
  const { 
    conversations, 
    unreadCount, 
    markConversationAsRead, 
    sendMessage: sendChatMessage, 
    loadMessages 
  } = useChat();
  const navigate = useNavigate();

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      // Charger les vrais messages de la conversation
      const realMessages = await loadMessages(chat.id);
      
      // Formatter les messages pour l'affichage
      const formattedMessages = realMessages.map(msg => {
        let content = msg.content;
        
        // Si c'est un message projet et que le contenu est un objet, conserver l'objet
        if (msg.type === 'project' && typeof msg.content === 'object') {
          content = msg.content;
        } else if (msg.type === 'project' && typeof msg.content === 'string') {
          content = msg.content;
        }
        
        return {
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName || 'Utilisateur',
          content: content,
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text',
          isOwn: msg.isOwn
        };
      });
      
      setMessages(formattedMessages);
      markConversationAsRead(chat.id);
    } catch (error) {
      console.error('❌ Tatoueur - Erreur chargement messages:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      await sendChatMessage(selectedChat.id, message);
      setMessage('');
      
      // Recharger les messages
      const updatedMessages = await loadMessages(selectedChat.id);
      const formattedMessages = updatedMessages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName || 'Utilisateur',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        type: msg.type || 'text',
        isOwn: msg.isOwn
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Tatoueur - Erreur envoi message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const goBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCreateQuote = () => {
    console.log('Creating quote for chat:', {
      id: selectedChat.id,
      clientId: selectedChat.clientId,
      otherParticipantId: selectedChat.otherParticipantId,
      otherParticipantName: selectedChat.otherParticipantName,
      clientName: selectedChat.clientName,
      participants: selectedChat.participants
    });
    setShowQuoteEditor(true);
  };

  const handleQuoteCreated = (newQuote) => {
    setShowQuoteEditor(false);
    // Optionnel: recharger les messages pour voir le nouveau devis
    if (selectedChat) {
      handleSelectChat(selectedChat);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBackToDashboard}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Retour au dashboard
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Messages Clients</h1>
            <p className="text-gray-600 text-sm">Gérez vos conversations avec vos clients</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 bg-white shadow-lg overflow-hidden">
        {/* Liste des conversations - collée à gauche */}
        <div className={`${
          isMobile && selectedChat ? 'hidden' : 'block'
        } w-full md:w-80 border-r border-gray-200 flex-shrink-0 h-full`}>
          <TattooArtistChatList conversations={conversations} onSelectChat={handleSelectChat} />
        </div>

        {/* Interface de chat VRAIE - remplace ChatInterface avec messages de démo */}
        <div className={`${
          isMobile && !selectedChat ? 'hidden' : 'block'
        } flex-1 flex flex-col`}>
          {selectedChat ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Header du chat */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {selectedChat.otherParticipantName?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.otherParticipantName || 'Client'}
                      </h3>
                      <p className="text-sm text-gray-500">Client</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">
                    <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Aucun message dans cette conversation</p>
                    <p className="text-sm text-gray-400">Les nouveaux messages apparaîtront ici</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id} className="message-container">
                      {/* Indicateur de temps si nécessaire */}
                      {index === 0 || 
                        (new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString()) && (
                        <div className="text-center my-6">
                          <span className="bg-white px-4 py-2 text-sm text-gray-500 rounded-full shadow-sm border">
                            {new Date(msg.timestamp).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} mb-6`}>
                        {/* Avatar pour les messages du client */}
                        {!msg.isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-white text-sm font-semibold mr-3 mt-2 flex-shrink-0">
                            {selectedChat.otherParticipantName?.charAt(0) || 'C'}
                          </div>
                        )}

                        <div className="flex flex-col max-w-2xl">
                          {/* Nom de l'expéditeur */}
                          {!msg.isOwn && (
                            <span className="text-sm text-gray-600 font-medium mb-1 px-1">
                              {selectedChat.otherParticipantName || 'Client'}
                            </span>
                          )}

                          {/* Bulle de message */}
                          <div 
                            className={`px-6 py-4 rounded-2xl shadow-sm relative ${
                              msg.isOwn 
                                ? 'bg-blue-600 text-white rounded-br-md' 
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                            }`}
                          >
                            {msg.type === 'project' ? (
                              <div className="project-message-tattoo-artist">
                                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                              </div>
                            ) : (
                              <div>
                                <p className={`text-base leading-relaxed ${
                                  msg.isOwn ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {msg.content}
                                </p>
                              </div>
                            )}
                            
                            {/* Heure du message */}
                            <div className={`text-xs mt-2 ${
                              msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Avatar pour les messages du tatoueur */}
                        {msg.isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-gray-600 flex items-center justify-center text-white text-sm font-semibold ml-3 mt-2 flex-shrink-0">
                            {user?.name?.charAt(0) || 'T'}
                          </div>
                        )}
                      </div>
                      
                      {/* Bouton créer devis pour les messages de projet du client */}
                      {msg.type === 'project' && !msg.isOwn && (
                        <div className="flex justify-start mt-3 ml-11">
                          <button
                            onClick={handleCreateQuote}
                            className="flex items-center gap-3 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <FileText className="w-5 h-5" />
                            Créer un devis pour ce projet
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Input de message */}
              <div className="border-t bg-white p-6 shadow-lg">
                <div className="flex items-end gap-4">
                  {/* Zone de saisie étendue */}
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Écrivez votre réponse au client... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                      className="w-full px-6 py-4 pr-16 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px] max-h-32"
                      rows="2"
                    />
                    <div className="absolute right-4 bottom-3 flex items-center gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Joindre un fichier"
                      >
                        <Paperclip size={20} className="text-gray-400" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Insérer un emoji"
                      >
                        <Smile size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Bouton d'envoi amélioré */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                    title="Envoyer le message"
                  >
                    <Send size={20} />
                  </button>
                </div>
                
                {/* Indicateurs utiles */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Conversation avec {selectedChat.otherParticipantName || 'Client'}
                  </span>
                  <span>
                    Appuyez sur Entrée pour envoyer
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // État vide amélioré
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
              <div className="text-center max-w-md">
                <MessageCircle size={80} className="mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Sélectionnez une conversation</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Choisissez un client dans la liste pour consulter votre conversation et répondre à ses questions sur ses projets de tatouage.
                </p>
                
                {unreadCount > 0 && (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">
                      {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2">💡 Conseils</h4>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Répondez rapidement pour améliorer l'expérience client</li>
                    <li>• Utilisez l'éditeur de devis pour les demandes de projet</li>
                    <li>• Les messages projet sont automatiquement formatés</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Éditeur de devis */}
      {showQuoteEditor && selectedChat && (
        <QuoteEditor
          conversationId={selectedChat.id}
          clientId={selectedChat.clientId || selectedChat.otherParticipantId}
          clientName={selectedChat.otherParticipantName || selectedChat.clientName}
          onClose={() => setShowQuoteEditor(false)}
          onSave={handleQuoteCreated}
        />
      )}
    </div>
  );
}

// Liste des conversations adaptée pour les tatoueurs
function TattooArtistChatList({ conversations, onSelectChat }) {
  const [filter, setFilter] = useState('all'); // all, unread, active

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread') return conv.unreadCount > 0;
    if (filter === 'active') return conv.isActive;
    return true;
  });

  const formatLastMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Maintenant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}j`;
    return messageTime.toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filtres améliorés */}
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversations clients</h2>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Toutes', count: conversations.length, color: 'gray' },
            { key: 'unread', label: 'Non lues', count: conversations.filter(c => c.unreadCount > 0).length, color: 'red' },
            { key: 'active', label: 'Projets actifs', count: conversations.filter(c => c.isActive).length, color: 'green' }
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filter === key 
                    ? 'bg-white/20 text-white' 
                    : color === 'red' 
                      ? 'bg-red-100 text-red-700'
                      : color === 'green'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des conversations améliorée */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">Aucune conversation</p>
            <p className="text-sm text-gray-400">
              {filter === 'unread' ? 'Tous vos messages sont lus' : 
               filter === 'active' ? 'Aucun projet actif actuellement' : 
               'Aucune conversation pour le moment'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                className={`relative flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                  conv.unreadCount > 0 ? 'bg-blue-50/50 hover:bg-blue-50' : ''
                }`}
              >
                {/* Indicateur non lu */}
                {conv.unreadCount > 0 && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-full"></div>
                )}

                {/* Avatar amélioré */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {conv.clientAvatar}
                  </div>
                  {conv.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg">
                      <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* Infos conversation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                      {conv.clientName}
                    </h3>
                    <div className="flex items-center gap-3">
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold min-w-[24px] text-center shadow-lg">
                          {conv.unreadCount}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 font-medium">
                        {formatLastMessageTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm truncate mb-3 leading-relaxed ${
                    conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    {conv.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      📋 {conv.projectType}
                    </span>
                    {conv.isActive && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <Star size={14} fill="currentColor" />
                        <span>Projet en cours</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicateur de hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
