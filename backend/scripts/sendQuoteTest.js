const mongoose = require('mongoose');
const User = require('../models/User');
const Quote = require('../models/Quote');
const { Conversation, Message } = require('../models/Chat');
require('dotenv').config();

async function sendTestQuoteDirectly() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver ou créer un tatoueur
    let artist = await User.findOne({ role: 'tattoo_artist' });
    if (!artist) {
      artist = new User({
        email: 'artist@test.com',
        nom: 'TestArtist', 
        prenom: 'Tattoo',
        role: 'tattoo_artist',
        password: 'tattoo123', // Mot de passe en clair pour les tests
        specialty: 'Japonais'
      });
      await artist.save();
      console.log('🎨 Tatoueur créé avec mdp: tattoo123');
    }

    // Trouver ou créer un client
    let client = await User.findOne({ role: 'client' });
    if (!client) {
      client = new User({
        email: 'john@example.com',
        nom: 'Doe',
        prenom: 'John',
        role: 'client', 
        password: 'tattoo123' // Mot de passe en clair pour les tests
      });
      await client.save();
      console.log('👤 Client créé avec mdp: tattoo123');
    }

    console.log('👥 Utilisateurs:', artist.email, 'et', client.email);

    // Trouver ou créer une conversation
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [artist._id, client._id] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { userId: artist._id, role: 'tattoo_artist' },
          { userId: client._id, role: 'client' }
        ],
        lastMessage: null,
        lastMessageTime: new Date(),
        unreadCount: { [client._id]: 0, [artist._id]: 0 }
      });
      await conversation.save();
      console.log('✅ Conversation créée:', conversation._id);
    } else {
      console.log('✅ Conversation existante:', conversation._id);
    }

    // Données du devis
    const quoteId = new mongoose.Types.ObjectId();
    const now = new Date();
    const quoteNumber = `DEV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const title = 'Dragon Japonais - Avant-bras';
    const price = 750;

    console.log('📋 Création du devis:', quoteNumber);

    // Créer le document Quote dans la base de données
    const quote = new Quote({
      _id: quoteId,
      quoteNumber: quoteNumber,
      title: title,
      tattooArtistId: artist._id,
      clientId: client._id,
      conversationId: conversation._id,
      items: [
        {
          description: 'Design et création du stencil personnalisé',
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100
        },
        {
          description: 'Première session - Contours et ombrage (3h)',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350
        },
        {
          description: 'Seconde session - Détails et finitions (3h)', 
          quantity: 1,
          unitPrice: 300,
          totalPrice: 300
        }
      ],
      subtotal: price, // Champ requis
      taxRate: 0,
      taxAmount: 0,
      totalAmount: price,
      status: 'sent', // Status valide au lieu de 'pending'
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      notes: 'Tatouage réalisé en 2 séances de 3h chacune. Soins post-tatouage et retouches inclus.',
      terms: 'Acompte de 30% requis à la validation du devis. Soins post-tatouage et conseils inclus. Garantie retouches 6 mois.',
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await quote.save();
    console.log('✅ Document Quote sauvegardé:', quote._id);

    // HTML du devis avec design noir moderne - construction par parties
    const headerHtml = '<div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 2px solid #404040; border-radius: 16px; padding: 24px; margin: 16px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3); font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; max-width: 500px;">';
    
    const titleHtml = '<div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #404040;"><h2 style="margin: 0 0 8px 0; color: #fff; font-size: 24px; font-weight: 700;">📋 Devis Tatouage</h2><p style="margin: 0; color: #a0a0a0; font-size: 14px;">N° ' + quoteNumber + '</p></div>';
    
    const projectHtml = '<div style="margin-bottom: 20px;"><h3 style="margin: 0 0 12px 0; color: #fff; font-size: 18px; font-weight: 600;">' + title + '</h3><p style="margin: 0 0 16px 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">Tatouage dragon japonais traditionnel sur l\'avant-bras, style noir et gris avec détails fins</p></div>';
    
    const priceHtml = '<div style="background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px; border: 1px solid #9ca3af;"><p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Prix total</p><p style="margin: 0; color: #fff; font-size: 28px; font-weight: 700;">' + price + ' EUR</p></div>';
    
    const buttonsHtml = '<div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 16px;"><button onclick="handleQuoteAction(\'accept\', \'' + quoteId + '\')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">✅ Accepter</button><button onclick="handleQuoteAction(\'decline\', \'' + quoteId + '\')" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;">❌ Refuser</button></div><div style="display: flex; justify-content: center; margin-bottom: 16px;"><button onclick="handleQuoteAction(\'view_pdf\', \'' + quoteId + '\')" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 13px; cursor: pointer;">📄 Voir le PDF</button></div>';
    
    const footerHtml = '<div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #404040;"><p style="margin: 0; color: #a0a0a0; font-size: 12px;">Devis proposé par <strong style="color: #fff;">' + (artist.nom || 'Artiste') + ' ' + (artist.prenom || '') + '</strong></p></div></div>';

    const quoteHtml = headerHtml + titleHtml + projectHtml + priceHtml + buttonsHtml + footerHtml;

    // Créer le message
    const message = new Message({
      conversationId: conversation._id,
      senderId: artist._id,
      senderName: artist.nom + ' ' + artist.prenom,
      content: quoteHtml,
      type: 'quote',
      timestamp: new Date(),
      metadata: {
        messageType: 'html_quote',
        quoteId: quoteId,
        quoteNumber: quoteNumber,
        price: price,
        currency: 'EUR',
        status: 'pending'
      }
    });

    await message.save();

    // Mettre à jour la conversation
    conversation.lastMessage = message._id; // Utiliser l'ID du message, pas le texte
    conversation.lastMessageTime = new Date();
    await conversation.save();

    console.log('🎉 Devis HTML envoyé avec succès!');
    console.log('📋 Numéro:', quoteNumber);
    console.log('💰 Prix:', price, 'EUR');
    console.log('💬 Message ID:', message._id);
    console.log('📱 Conversation ID:', conversation._id);

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

sendTestQuoteDirectly();
