import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';

export default function ChatList({ onSelectChat, onStartNewChat }) {
  const { user } = useAuth();
  const { conversations, loading, error, getTattooArtists } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [tattooArtists, setTattooArtists] = useState([]);

  // Charger la liste des tatoueurs disponibles pour les clients
  useEffect(() => {
    if (user?.role === 'user') {
      loadTattooArtists();
    }
  }, [user]);

  const loadTattooArtists = async () => {
    try {
      const artists = await getTattooArtists();
      setTattooArtists(artists);
    } catch (err) {
      console.error('Erreur lors du chargement des tatoueurs:', err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    // Adapter selon la structure de la conversation backend
    const otherParticipant = conv.participants?.find(p => p._id !== user?._id);
    if (otherParticipant) {
      return otherParticipant.name.toLowerCase().includes(searchLower);
    }
    return false;
  });

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

  const getParticipantName = (conv) => {
    const otherParticipant = conv.participants?.find(p => p._id !== user?._id);
    return otherParticipant?.name || 'Utilisateur inconnu';
  };

  const getParticipantInitials = (conv) => {
    const name = getParticipantName(conv);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const startNewChat = () => {
    if (onStartNewChat) {
      onStartNewChat(tattooArtists);
    } else {
      alert('Fonctionnalité "Nouvelle conversation" bientôt disponible ! 💬');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-center flex-1">
          <div className="text-gray-500">Chargement des conversations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-500">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <button 
            onClick={startNewChat}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucune conversation'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectChat(conv)}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              {/* Avatar avec indicateur en ligne */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {conv.artistAvatar}
                </div>
                {conv.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Infos conversation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.artistName}
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
                  Spécialité: {conv.specialty}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info en bas */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{filteredConversations.filter(c => c.isOnline).length} artistes en ligne</span>
        </div>
      </div>
    </div>
  );
}
