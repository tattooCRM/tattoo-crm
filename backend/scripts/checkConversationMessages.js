const mongoose = require('mongoose');
const { Conversation, Message } = require('../models/Chat');
const User = require('../models/User'); // Importer le modèle User
require('dotenv').config();

// Script pour vérifier les messages dans la conversation de test
async function checkConversationMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔍 Vérification des messages dans la conversation...\n');

    // Récupérer la conversation de test
    const conversation = await Conversation.findOne()
      .populate('participants.userId', 'name email')
      .sort({ createdAt: -1 });

    if (!conversation) {
      console.log('❌ Aucune conversation trouvée');
      return;
    }

    console.log('📞 Conversation trouvée:', conversation._id);
    console.log('👥 Participants:');
    conversation.participants.forEach(p => {
      console.log(`  - ${p.userId.name} (${p.userId.email}) - ${p.role}`);
    });
    console.log('');

    // Récupérer tous les messages de cette conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name email')
      .sort({ timestamp: -1 });

    console.log(`💬 ${messages.length} message(s) dans cette conversation:`);
    console.log('=========================================');

    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ${msg._id}:`);
      console.log(`   Expéditeur: ${msg.senderId.name} (${msg.senderId.email})`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Timestamp: ${msg.timestamp}`);
      
      if (msg.metadata) {
        console.log(`   Metadata:`, msg.metadata);
      }
      
      console.log(`   Contenu (100 premiers caractères):`);
      console.log(`   "${msg.content.substring(0, 100)}..."`);
      
      if (msg.type === 'quote') {
        console.log(`   ✅ DEVIS TROUVÉ !`);
        console.log(`   Message Type: ${msg.metadata?.messageType}`);
        console.log(`   Contient HTML: ${msg.content.includes('<div style')}`);
      }
    });

    if (messages.length === 0) {
      console.log('\n❌ Aucun message trouvé dans cette conversation');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter la vérification
checkConversationMessages();
