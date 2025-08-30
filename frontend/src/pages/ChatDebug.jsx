import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';

const ChatDebug = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, loadConversations } = useChat();
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('Page chargée');
    addDebugInfo(`Location state: ${JSON.stringify(location.state)}`);
    addDebugInfo(`User: ${user?.name} (${user?.role})`);
  }, [location.state, user]);

  useEffect(() => {
    addDebugInfo(`Conversations chargées: ${conversations.length}`);
    conversations.forEach(conv => {
      addDebugInfo(`- Conversation ID: ${conv.id} avec ${conv.artistName || conv.clientName}`);
    });
  }, [conversations]);

  const handleReloadConversations = async () => {
    addDebugInfo('Rechargement forcé des conversations...');
    try {
      await loadConversations();
      addDebugInfo('Conversations rechargées avec succès');
    } catch (error) {
      addDebugInfo(`Erreur rechargement: ${error.message}`);
    }
  };

  const handleGoToChat = () => {
    if (location.state?.conversationId) {
      const targetConv = conversations.find(c => c.id === location.state.conversationId);
      if (targetConv) {
        addDebugInfo(`Redirection vers chat avec conversation: ${targetConv.artistName || targetConv.clientName}`);
        navigate('/chat');
      } else {
        addDebugInfo('Conversation introuvable dans la liste');
      }
    } else {
      addDebugInfo('Aucun ID de conversation dans le state');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Debug</h1>
      
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={handleReloadConversations}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recharger conversations
            </button>
            <button 
              onClick={handleGoToChat}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Aller au chat
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">État actuel</h2>
          <p>Utilisateur: {user?.name} ({user?.role})</p>
          <p>Loading: {loading ? 'Oui' : 'Non'}</p>
          <p>Nombre de conversations: {conversations.length}</p>
          <p>ID de conversation cible: {location.state?.conversationId || 'Aucun'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Conversations disponibles</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500">Aucune conversation</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map(conv => (
                <li key={conv.id} className="p-2 bg-gray-50 rounded">
                  <strong>ID:</strong> {conv.id}<br />
                  <strong>Avec:</strong> {conv.artistName || conv.clientName}<br />
                  <strong>Dernier message:</strong> {conv.lastMessage}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Log de debug</h2>
          <div className="bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-sm font-mono">
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDebug;
