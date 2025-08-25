import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatInterface({ onBack, chat, isTattooArtist }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 'tattoo_artist_1',
      senderName: 'Marie Dubois',
      content: 'Salut ! Je vois que tu es intéressé par un tatouage. Quel style t\'intéresse ?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: 2,
      senderId: user?.id || 'client_1',
      senderName: user?.nom || 'Client',
      content: 'Bonjour ! Je cherche quelque chose de minimaliste, peut-être géométrique.',
      timestamp: new Date(Date.now() - 3300000),
      type: 'text'
    },
    {
      id: 3,
      senderId: 'tattoo_artist_1',
      senderName: 'Marie Dubois',
      content: 'Parfait ! J\'adore les designs géométriques. As-tu une zone du corps en tête ?',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text'
    }
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: user?.id || 'current_user',
      senderName: user?.nom || user?.prenom || 'Vous',
      content: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simuler une réponse automatique
    setTimeout(() => {
      const responses = [
        "Excellente idée ! Ces zones sont parfaites pour un premier tatouage.",
        "Je peux te montrer quelques designs similaires. Tu préfères du noir ou avec des couleurs ?",
        "Super choix ! On pourrait prévoir un rendez-vous pour en discuter plus en détail.",
        "J'ai quelques créations qui pourraient te plaire. Tu veux que je te les envoie ?",
        "Parfait ! Je vais préparer quelques propositions pour toi 🎨"
      ];
      
      const autoReply = {
        id: Date.now() + 1,
        senderId: 'tattoo_artist_1',
        senderName: 'Marie Dubois',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, autoReply]);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newMessage = {
      id: Date.now(),
      senderId: user?.id || 'current_user',
      senderName: user?.nom || user?.prenom || 'Vous',
      content: `Image partagée: ${file.name}`,
      timestamp: new Date(),
      type: 'image',
      fileUrl: URL.createObjectURL(file)
    };

    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {chat?.artistAvatar || 'MD'}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">{chat?.artistName || 'Marie Dubois'}</h3>
            <p className="text-sm flex items-center gap-1 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages - zone avec overflow */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => {
          const isOwn = msg.senderId === (user?.id || 'current_user');
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isOwn 
                  ? 'bg-black text-white rounded-br-sm' 
                  : 'bg-white text-gray-900 rounded-bl-sm border'
              }`}>
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1 text-purple-600">
                    {msg.senderName}
                  </p>
                )}
                
                {msg.type === 'image' ? (
                  <div>
                    <img src={msg.fileUrl} alt="Image partagée" className="rounded-lg max-w-full mb-2" />
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                
                <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-500'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - zone fixe en bas */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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
    </div>
  );
}
