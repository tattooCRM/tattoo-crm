const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const { Conversation, Message } = require('../models/Chat');
const Quote = require('../models/Quote');
const User = require('../models/User');

async function sendTestQuote() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');

    // Trouver le dernier devis créé
    const quote = await Quote.findOne().sort({ createdAt: -1 });
    if (!quote) {
      console.log('❌ Aucun devis trouvé');
      return;
    }

    console.log('📋 Devis trouvé:', {
      id: quote._id,
      number: quote.number,
      client: quote.client,
      artist: quote.artist
    });

    // Utiliser la conversation existante
    const conversation = await Conversation.findOne();
    if (!conversation) {
      console.log('❌ Aucune conversation trouvée');
      return;
    }

    console.log('💬 Conversation trouvée:', conversation._id);

    // Créer le contenu HTML du message de devis
    const quoteHtml = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 24px;
        margin: 16px 0;
        color: white;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        ">
          <div style="
            background: rgba(255,255,255,0.2);
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
          ">
            <span style="font-size: 24px;">📋</span>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 600;">Devis ${quote.number}</h3>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">${quote.title || 'Devis Tatouage'}</p>
          </div>
        </div>
        
        <!-- Contenu -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 16px; opacity: 0.9;">Montant total</span>
            <span style="font-size: 28px; font-weight: 700;">${quote.totalAmount || '150.00'} €</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 14px; opacity: 0.8; margin-bottom: 8px;">
            <span>Sous-total</span>
            <span>${quote.totalAmount || '150.00'} €</span>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 12px;
            margin: 16px 0;
          ">
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">VALABLE JUSQU'AU</div>
            <div style="font-size: 16px; font-weight: 600;">${quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString('fr-FR') : '31/12/2025'}</div>
          </div>
        </div>
        
        <!-- Actions -->
        <div style="
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.2);
        ">
          <a href="http://localhost:5000/api/quotes/${quote._id}/pdf" 
             target="_blank"
             style="
               flex: 1;
               background: rgba(255,255,255,0.2);
               border: 1px solid rgba(255,255,255,0.3);
               color: white;
               padding: 12px 20px;
               border-radius: 8px;
               font-weight: 600;
               text-decoration: none;
               text-align: center;
               display: inline-block;
               transition: all 0.3s ease;
             ">
            📄 Télécharger PDF
          </a>
          
          <button style="
            flex: 1;
            background: #10b981;
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          " onclick="acceptQuote('${quote._id}')">
            ✅ Accepter
          </button>
        </div>
      </div>
    `;

    // Créer le message de devis d'abord
    const quoteMessage = new Message({
      conversationId: conversation._id,
      senderId: conversation.participants[1].userId, // L'artiste
      senderName: 'Test Artist',
      content: quoteHtml,
      timestamp: new Date(),
      type: 'quote' // Type important !
    });
    
    await quoteMessage.save();
    console.log('📝 Message de devis créé:', quoteMessage._id);

    // Mettre à jour la conversation avec la référence du message
    conversation.lastMessage = quoteMessage._id;
    conversation.lastActivity = new Date();

    await conversation.save();

    console.log('✅ Message de devis ajouté à la conversation avec le type "quote"');
    console.log('💬 ID de la conversation:', conversation._id);
    console.log('📋 Contenu du message (preview):', quoteHtml.substring(0, 200) + '...');

    // Mettre à jour le statut du devis
    quote.status = 'sent';
    quote.sentAt = new Date();
    await quote.save();

    console.log('✅ Statut du devis mis à jour: sent');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    console.log('🔌 Déconnexion MongoDB');
    await mongoose.disconnect();
  }
}

sendTestQuote();
