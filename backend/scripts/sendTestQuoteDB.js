const mongoose = require('mongoose');
const User = require('../models/User');
const { Conversation, Message } = require('../models/Chat');
require('dotenv').config();

// Import du contrôleur pour utiliser la logique de génération du message HTML
const path = require('path');

async function sendTestQuoteDirectly() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver ou créer un tatoueur
    let artist = await User.findOne({ role: 'tattoo_artist' });
    if (!artist) {
      console.log('🎨 Création d\'un tatoueur de test...');
      artist = new User({
        email: 'artist@test.com',
        nom: 'TestArtist',
        prenom: 'Tattoo',
        role: 'tattoo_artist',
        password: '$2b$10$EOMjmyUHWds/SAoYDCvEeuuHr8Bi5nMS/bKX.XgN185yQj7xQLd56',
        specialty: 'Japonais'
      });
      await artist.save();
    }

    // Trouver ou créer un client
    let client = await User.findOne({ role: 'client' });
    if (!client) {
      console.log('👤 Création d\'un client de test...');
      client = new User({
        email: 'john@example.com',
        nom: 'Doe',
        prenom: 'John',
        role: 'client',
        password: '$2b$10$EOMjmyUHWds/SAoYDCvEeuuHr8Bi5nMS/bKX.XgN185yQj7xQLd56'
      });
      await client.save();
    }

    console.log('👥 Utilisateurs trouvés:');
    console.log('🎨 Tatoueur:', artist.email, '-', artist.nom);
    console.log('👤 Client:', client.email, '-', client.nom);

    // Trouver ou créer une conversation
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [artist._id, client._id] }
    });

    if (!conversation) {
      console.log('📝 Création d\'une nouvelle conversation...');
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
      console.log('✅ Conversation existante trouvée:', conversation._id);
    }

    // Générer le numéro de devis
    const quoteNumber = `DEV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    console.log('📋 Génération du devis:', quoteNumber);

    // Générer le message HTML du devis avec le nouveau design noir
    const quoteData = {
      id: new mongoose.Types.ObjectId(),
      number: quoteNumber,
      title: 'Dragon Japonais - Avant-bras',
      description: 'Tatouage dragon japonais traditionnel sur l\\'avant-bras, style noir et gris avec détails fins',
      price: 750,
      currency: 'EUR',
      estimatedDuration: 6,
      sessionCount: 2,
      items: [
        { description: 'Design et création du stencil personnalisé', price: 100 },
        { description: 'Première session - Contours et ombrage (3h)', price: 350 },
        { description: 'Seconde session - Détails et finitions (3h)', price: 300 }
      ],
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      terms: 'Acompte de 30% requis à la validation du devis. Soins post-tatouage et conseils inclus. Garantie retouches 6 mois.',
      status: 'pending'
    };

    // Générer le HTML stylé pour le devis (design noir moderne)
    const itemsHtml = quoteData.items.map(item => 
      \`<div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #333;">
        <span style="color: #e5e7eb;">\${item.description}</span>
        <span style="color: #fff; font-weight: 600;">\${item.price}€</span>
      </div>\`
    ).join('');

    const quoteHtml = \`
      <div style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 2px solid #404040;
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #ffffff;
        max-width: 500px;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #404040;">
          <h2 style="margin: 0 0 8px 0; color: #fff; font-size: 24px; font-weight: 700;">📋 Devis Tatouage</h2>
          <p style="margin: 0; color: #a0a0a0; font-size: 14px;">N° \${quoteData.number}</p>
        </div>

        <!-- Projet -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: #fff; font-size: 18px; font-weight: 600;">\${quoteData.title}</h3>
          <p style="margin: 0 0 16px 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">\${quoteData.description}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid #333;">
              <span style="color: #a0a0a0; font-size: 12px; display: block;">Durée estimée</span>
              <span style="color: #fff; font-weight: 600;">\${quoteData.estimatedDuration}h</span>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid #333;">
              <span style="color: #a0a0a0; font-size: 12px; display: block;">Nombre de séances</span>
              <span style="color: #fff; font-weight: 600;">\${quoteData.sessionCount}</span>
            </div>
          </div>
        </div>

        <!-- Détail des prestations -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: #fff; font-size: 16px; font-weight: 600;">Détail des prestations</h4>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border: 1px solid #333;">
            \${itemsHtml}
          </div>
        </div>

        <!-- Prix total -->
        <div style="
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
          border: 1px solid #5b21b6;
        ">
          <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.9); font-size: 14px;">Prix total</p>
          <p style="margin: 0; color: #fff; font-size: 28px; font-weight: 700;">\${quoteData.price} \${quoteData.currency}</p>
        </div>

        <!-- Conditions -->
        <div style="margin-bottom: 24px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border: 1px solid #333;">
          <h5 style="margin: 0 0 8px 0; color: #fff; font-size: 14px; font-weight: 600;">📋 Conditions</h5>
          <p style="margin: 0; color: #d1d5db; font-size: 13px; line-height: 1.4;">\${quoteData.terms}</p>
          <p style="margin: 8px 0 0 0; color: #fbbf24; font-size: 12px;">
            ⏰ Validité: jusqu'au \${new Date(quoteData.validUntil).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <!-- Boutons d'action -->
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button 
            onclick="handleQuoteAction('accept', '\${quoteData.id}')"
            style="
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(16, 185, 129, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'"
          >
            ✅ Accepter
          </button>
          <button 
            onclick="handleQuoteAction('decline', '\${quoteData.id}')"
            style="
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(239, 68, 68, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'"
          >
            ❌ Refuser
          </button>
        </div>

        <!-- Signature -->
        <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #404040;">
          <p style="margin: 0; color: #a0a0a0; font-size: 12px;">
            Devis proposé par <strong style="color: #fff;">\${artist.nom} \${artist.prenom}</strong>
          </p>
        </div>
      </div>\`;

    // Créer le message
    const message = new Message({
      conversationId: conversation._id,
      senderId: artist._id,
      senderName: \`\${artist.nom} \${artist.prenom}\`,
      content: quoteHtml,
      type: 'quote',
      timestamp: new Date(),
      metadata: {
        messageType: 'html_quote',
        quoteId: quoteData.id,
        quoteNumber: quoteData.number,
        price: quoteData.price,
        currency: quoteData.currency,
        status: quoteData.status
      }
    });

    await message.save();
    console.log('✅ Message de devis HTML créé:', message._id);

    // Mettre à jour la conversation
    conversation.lastMessage = \`Nouveau devis: \${quoteData.title} - \${quoteData.price}€\`;
    conversation.lastMessageTime = new Date();
    conversation.unreadCount.set(client._id.toString(), (conversation.unreadCount.get(client._id.toString()) || 0) + 1);
    await conversation.save();

    console.log('🎉 Devis envoyé avec succès!');
    console.log('📋 Numéro de devis:', quoteData.number);
    console.log('💰 Prix:', quoteData.price, quoteData.currency);
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
