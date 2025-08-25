import React, { useState } from 'react';
import ChatList from '../../assets/components/ChatList';
import ChatInterface from '../../assets/components/ChatInterface';
import { MessageCircle, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { useNavigate } from 'react-router-dom';

export default function TattooArtistChat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();
  const { conversations, unreadCount, markConversationAsRead } = useChat();
  const navigate = useNavigate();

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    markConversationAsRead(chat.id);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const goBackToDashboard = () => {
    navigate('/dashboard');
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

      <div className="flex flex-1 max-w-7xl mx-auto bg-white shadow-lg overflow-hidden">
        {/* Liste des conversations - version tatoueur avec plus d'infos */}
        <div className={`${
          isMobile && selectedChat ? 'hidden' : 'block'
        } w-full md:w-96 border-r border-gray-200 flex-shrink-0`}>
          <TattooArtistChatList conversations={conversations} onSelectChat={handleSelectChat} />
        </div>

        {/* Interface de chat */}
        <div className={`${
          isMobile && !selectedChat ? 'hidden' : 'block'
        } flex-1 flex flex-col`}>
          {selectedChat ? (
            <ChatInterface 
              chat={selectedChat} 
              onBack={handleBackToList}
              isTattooArtist={true}
            />
          ) : (
            // État vide
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={64} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-sm text-center max-w-sm">
                Choisissez un client dans la liste pour consulter votre conversation et répondre à ses questions.
              </p>
              
              {unreadCount > 0 && (
                <div className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                  Vous avez {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
      {/* Filtres */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tous', count: conversations.length },
            { key: 'unread', label: 'Non lus', count: conversations.filter(c => c.unreadCount > 0).length },
            { key: 'active', label: 'Actifs', count: conversations.filter(c => c.isActive).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune conversation {filter !== 'all' && `(${filter})`}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectChat(conv)}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                conv.unreadCount > 0 ? 'bg-blue-50 border-blue-100' : ''
              }`}
            >
              {/* Avatar avec indicateur projet */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold">
                  {conv.clientAvatar}
                </div>
                {conv.isActive && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Infos conversation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.clientName}
                  </h3>
                  <div className="flex items-center gap-2">
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {conv.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(conv.lastMessageTime)}
                    </span>
                  </div>
                </div>
                
                <p className={`text-sm truncate mb-1 ${
                  conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                }`}>
                  {conv.lastMessage}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {conv.projectType}
                  </span>
                  {conv.isActive && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Star size={12} />
                      <span>Projet actif</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
