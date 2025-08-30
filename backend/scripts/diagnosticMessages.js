const mongoose = require('mongoose');
const { Conversation, Message } = require('../models/Chat');
const User = require('../models/User');

async function diagnosticMessages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tattoo-crm');
    
    // Récupérer tous les utilisateurs
    const allUsers = await User.find().select('name prenom email role slug createdAt');
    
    const clients = allUsers.filter(u => u.role === 'client');
    const artists = allUsers.filter(u => u.role === 'tattoo_artist');
    
    
    // Lister tous les clients
    clients.forEach((client, i) => {
    });
    
    artists.forEach((artist, i) => {
    });
    
    // Récupérer toutes les conversations
    const conversations = await Conversation.find()
      .populate('participants.userId', 'name prenom email role slug createdAt')
      .populate('lastMessage')
      .sort({ createdAt: -1 });
    
    
    // Analyser chaque conversation
    for (let i = 0; i < conversations.length; i++) {
      const conv = conversations[i];
      
      conv.participants.forEach(p => {
        const user = p.userId;
        if (user) {
        }
      });
      
      // Récupérer tous les messages de cette conversation
      const messages = await Message.find({ conversationId: conv._id })
        .populate('senderId', 'name prenom email role slug createdAt')
        .sort({ createdAt: 1 });
      
      
      if (messages.length > 0) {
        messages.forEach((msg, j) => {
          const sender = msg.senderId;
          const senderInfo = sender ? 
            `${sender.name || sender.prenom || sender.email} (${sender.role})` : 
            'SENDER INCONNU';
          
          
          // Identifier les messages potentiellement de démonstration
          const isDemoLikely = 
            msg.content?.includes('Message de démonstration') ||
            msg.content?.includes('Test message') ||
            msg.content?.includes('Demo') ||
            msg.content?.includes('Exemple') ||
            (sender && sender.email && (
              sender.email.includes('test') ||
              sender.email.includes('demo') ||
              sender.email.includes('example')
            ));
          
          if (isDemoLikely) {
          }
        });
      }
      
    }
    
    // Identifier les messages potentiellement de démonstration
    
    const allMessages = await Message.find()
      .populate('senderId', 'name prenom email role createdAt')
      .sort({ createdAt: -1 });
    
    const demoMessages = allMessages.filter(msg => {
      const sender = msg.senderId;
      return (
        msg.content?.includes('Message de démonstration') ||
        msg.content?.includes('Test message') ||
        msg.content?.includes('Demo') ||
        msg.content?.includes('Exemple') ||
        (sender && sender.email && (
          sender.email.includes('test') ||
          sender.email.includes('demo') ||
          sender.email.includes('example')
        ))
      );
    });
    
    
    if (demoMessages.length > 0) {
      demoMessages.forEach((msg, i) => {
        const sender = msg.senderId;
      });
    }
    
    // Messages récents des vrais clients
    const recentRealClientMessages = allMessages
      .filter(msg => {
        const sender = msg.senderId;
        return sender && 
               sender.role === 'client' && 
               !sender.email?.includes('test') && 
               !sender.email?.includes('demo') &&
               !msg.content?.includes('démonstration') &&
               !msg.content?.includes('Test');
      })
      .slice(0, 10);
    
    recentRealClientMessages.forEach((msg, i) => {
      const sender = msg.senderId;
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  }
}

diagnosticMessages();
