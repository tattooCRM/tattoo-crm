const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const { Conversation } = require('../models/Chat');
const User = require('../models/User');

async function addUserToConversation() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');

    // Trouver l'utilisateur test
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Utilisateur test non trouvé');
      return;
    }

    console.log('👤 Utilisateur test trouvé:', testUser._id);

    // Trouver la conversation
    const conversationId = '68ae0861745ae092658290de';
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('❌ Conversation non trouvée');
      return;
    }

    console.log('💬 Conversation trouvée');
    console.log('Participants actuels:', conversation.participants.map(p => ({
      userId: p.userId,
      role: p.role
    })));

    // Vérifier si l'utilisateur est déjà participant
    const isAlreadyParticipant = conversation.participants.some(p => 
      p.userId.toString() === testUser._id.toString()
    );

    if (isAlreadyParticipant) {
      console.log('ℹ️  L\'utilisateur est déjà participant');
    } else {
      // Ajouter l'utilisateur comme participant
      conversation.participants.push({
        userId: testUser._id,
        role: 'client',
        joinedAt: new Date()
      });

      await conversation.save();
      console.log('✅ Utilisateur test ajouté à la conversation');
    }

    console.log('📝 Participants finaux:', conversation.participants.map(p => ({
      userId: p.userId,
      role: p.role
    })));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    console.log('🔌 Déconnexion MongoDB');
    await mongoose.disconnect();
  }
}

addUserToConversation();
