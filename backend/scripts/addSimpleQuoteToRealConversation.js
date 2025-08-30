const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const { Conversation, Message } = require('../models/Chat');

async function addSimpleQuoteMessage() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');

    // Conversation réelle que vous voyez sur le site
    const conversationId = '68ae1c13c064602c060c9690';
    const senderId = '68adff2c75170138c65c2fde'; // Clément (artiste)
    
    // Créer un message de devis simple et lisible
    const quoteMessage = `📋 **Nouveau Devis DEV-202508-004**

💰 Montant : 450.00 €
📅 Valable jusqu'au : 30/09/2025

🔗 Voir le devis complet : http://localhost:5000/api/quotes/68b0a460e9064d52296b3f81/view
📄 Télécharger PDF : http://localhost:5000/api/quotes/68b0a460e9064d52296b3f81/pdf

Pour accepter ce devis, répondez "ACCEPTER"
Pour refuser ce devis, répondez "REFUSER"`;

    // Créer le message
    const message = new Message({
      conversationId: conversationId,
      senderId: senderId,
      content: quoteMessage,
      type: 'text', // Type text pour un rendu normal
      timestamp: new Date()
    });

    await message.save();
    console.log('✅ Message de devis simple créé:', message._id);

    // Mettre à jour la conversation
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();
      console.log('✅ Conversation mise à jour');
    }

    console.log('🎉 Message de devis ajouté à la conversation que vous voyez sur le site !');
    console.log('📱 Conversation ID:', conversationId);
    console.log('📝 Message content preview:', quoteMessage.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    console.log('🔌 Déconnexion MongoDB');
    await mongoose.disconnect();
  }
}

addSimpleQuoteMessage();
