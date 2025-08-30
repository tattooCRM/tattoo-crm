const mongoose = require('mongoose');
const { Conversation, Message } = require('../models/Chat');
const User = require('../models/User');
require('dotenv').config();

// Script pour créer une conversation de test entre un tatoueur et un client
async function createTestConversation() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔧 Création d\'une conversation de test...\n');

    // Trouver le tatoueur Clément et le client John
    const artist = await User.findOne({ email: 'clemvanker@gmail.com' });
    const client = await User.findOne({ email: 'john@example.com' });

    if (!artist || !client) {
      console.log('❌ Tatoueur ou client non trouvé');
      console.log('Artiste:', artist ? '✅' : '❌');
      console.log('Client:', client ? '✅' : '❌');
      return;
    }

    console.log('👨‍🎨 Tatoueur:', artist.name, '(' + artist.email + ')');
    console.log('👤 Client:', client.name, '(' + client.email + ')');

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': artist._id },
        { 'participants.userId': client._id }
      ]
    });

    if (conversation) {
      console.log('\n📞 Conversation existante trouvée:', conversation._id);
    } else {
      // Créer une nouvelle conversation
      conversation = new Conversation({
        participants: [
          {
            userId: artist._id,
            role: 'tattoo_artist',
            joinedAt: new Date()
          },
          {
            userId: client._id,
            role: 'client',
            joinedAt: new Date()
          }
        ],
        createdAt: new Date(),
        lastMessageTime: new Date()
      });

      await conversation.save();
      console.log('\n✅ Nouvelle conversation créée:', conversation._id);
    }

    // Ajouter un message d'accueil si la conversation est vide
    const messageCount = await Message.countDocuments({ conversationId: conversation._id });
    
    if (messageCount === 0) {
      const welcomeMessage = new Message({
        conversationId: conversation._id,
        senderId: client._id,
        content: 'Bonjour ! Je suis intéressé par un tatouage. Pouvez-vous me faire un devis ?',
        type: 'text',
        timestamp: new Date()
      });

      await welcomeMessage.save();
      console.log('💬 Message d\'accueil ajouté');
    }

    console.log('\n🎯 RÉSULTAT:');
    console.log('================');
    console.log('Conversation ID:', conversation._id.toString());
    console.log('Tatoueur ID:', artist._id.toString());
    console.log('Client ID:', client._id.toString());
    
    console.log('\nVous pouvez maintenant tester l\'envoi de devis entre ces deux comptes !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
createTestConversation();
