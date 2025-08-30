const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const { Conversation, Message } = require('../models/Chat');

async function testGetMessages() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');

    // Récupérer les messages de la conversation où le devis a été envoyé
    const conversationId = '68b0a460e9064d52296b3f80'; // Conversation du devis
    console.log('📱 Récupération des messages pour la conversation:', conversationId);
    
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(10);

    console.log('📝 Messages trouvés:', messages.length);
    
    messages.forEach((msg, index) => {
      console.log(`\n--- Message ${index + 1} ---`);
      console.log('ID:', msg._id);
      console.log('Type:', msg.type);
      console.log('Sender:', msg.senderId);
      console.log('Content preview:', msg.content ? msg.content.substring(0, 100) + '...' : 'No content');
      console.log('Timestamp:', msg.timestamp);
      
      if (msg.type === 'quote') {
        console.log('🎯 MESSAGE DE DEVIS TROUVÉ !');
        console.log('Contient <div>:', msg.content.includes('<div>'));
        console.log('Contient <div style:', msg.content.includes('<div style'));
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    console.log('🔌 Déconnexion MongoDB');
    await mongoose.disconnect();
  }
}

testGetMessages();
