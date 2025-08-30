const mongoose = require('mongoose');
const { Message } = require('../models/Chat');
const User = require('../models/User'); // Ajouter l'import du modèle User

async function checkLatestQuoteMessage() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');
    console.log('✅ Connexion MongoDB établie');

    // Récupérer les 5 derniers messages de type quote
    const quoteMessages = await Message.find({ type: 'quote' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'name');

    console.log('\n📋 Messages de devis récents:');
    quoteMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg._id}`);
      console.log(`   Conversation: ${msg.conversationId}`);
      console.log(`   Sender: ${msg.senderId?.name || msg.senderId}`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Date: ${msg.createdAt}`);
      console.log(`   Contenu (100 premiers chars): ${msg.content.substring(0, 100)}...`);
      
      if (msg.metadata) {
        console.log(`   Metadata:`);
        console.log(`     - messageType: ${msg.metadata.messageType}`);
        console.log(`     - quoteId: ${msg.metadata.quoteId}`);
        console.log(`     - buttons: ${msg.metadata.buttons ? msg.metadata.buttons.length : 0} boutons`);
        
        if (msg.metadata.buttons && msg.metadata.buttons.length > 0) {
          console.log(`     - Actions disponibles: ${msg.metadata.buttons.map(b => b.action).join(', ')}`);
        }
      }
    });

    // Récupérer aussi les derniers messages dans la conversation spécifique
    const conversationId = '68ae1c13c064602c060c9690';
    console.log(`\n💬 Derniers messages dans la conversation ${conversationId}:`);
    
    const conversationMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('senderId', 'name');
      
    conversationMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. ${msg.type} - ${msg.senderId?.name}`);
      console.log(`   Date: ${msg.createdAt}`);
      console.log(`   Contenu: ${msg.content.substring(0, 100)}...`);
      if (msg.metadata?.messageType) {
        console.log(`   MessageType: ${msg.metadata.messageType}`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

checkLatestQuoteMessage();
