const mongoose = require('mongoose');
const User = require('../models/User');
const { Conversation } = require('../models/Chat');
require('dotenv').config();

async function sendTestQuote() {
  try {
    // Connexion à MongoDB avec la bonne variable
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver un tatoueur et un client
    const artist = await User.findOne({ role: 'tattoo_artist' });
    const client = await User.findOne({ role: 'client' });

    if (!artist) {
      console.log('❌ Aucun tatoueur trouvé');
      return;
    }

    if (!client) {
      console.log('❌ Aucun client trouvé - Création d\'un client de test...');
      
      // Créer un client de test
      const newClient = new User({
        email: 'john@example.com',
        nom: 'Doe',
        prenom: 'John',
        role: 'client',
        password: '$2b$10$EOMjmyUHWds/SAoYDCvEeuuHr8Bi5nMS/bKX.XgN185yQj7xQLd56' // tattoo123
      });
      
      await newClient.save();
      console.log('✅ Client de test créé:', newClient.email);
    }

    // Trouver ou créer une conversation
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [artist._id, client?._id || (await User.findOne({ email: 'john@example.com' }))._id] }
    });

    if (!conversation) {
      console.log('📝 Création d\'une nouvelle conversation...');
      const clientToUse = client || await User.findOne({ email: 'john@example.com' });
      
      conversation = new Conversation({
        participants: [
          { userId: artist._id, role: 'tattoo_artist' },
          { userId: clientToUse._id, role: 'client' }
        ],
        messages: []
      });
      await conversation.save();
      console.log('✅ Conversation créée:', conversation._id);
    }

    console.log('🎯 Envoi du devis via l\'API...');

    // Envoyer le devis via l'API
    const response = await fetch('http://localhost:5000/api/quotes/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: conversation._id,
        artistId: artist._id,
        clientId: client?._id || (await User.findOne({ email: 'john@example.com' }))._id,
        title: 'Dragon Japonais',
        description: 'Tatouage dragon japonais sur le bras, style traditionnel',
        price: 850,
        currency: 'EUR',
        estimatedDuration: 8,
        sessionCount: 2,
        items: [
          { description: 'Design et création du stencil', price: 150 },
          { description: 'Première session (4h)', price: 400 },
          { description: 'Seconde session (4h)', price: 300 }
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        terms: 'Acompte de 30% requis à la validation. Soins post-tatouage inclus.'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Devis envoyé avec succès!');
      console.log('📋 ID du devis:', result.quote?.id);
      console.log('💬 Message ajouté à la conversation:', result.message?.id);
    } else {
      const error = await response.text();
      console.log('❌ Erreur API:', response.status, error);
    }

    await mongoose.disconnect();
    console.log('🏁 Test terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

sendTestQuote();
