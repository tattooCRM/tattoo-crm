const mongoose = require('mongoose');
const Quote = require('../models/Quote');
const User = require('../models/User');
const { Conversation, Message } = require('../models/Chat');

// Script pour tester l'envoi de devis
async function testQuoteSend() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');
    console.log('✅ Connexion MongoDB établie');

    // 1. Lister tous les devis
    const quotes = await Quote.find()
      .populate('tattooArtistId', 'name prenom nom email role')
      .populate('clientId', 'name prenom nom email role')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n📋 Devis disponibles:');
    quotes.forEach((quote, index) => {
      console.log(`${index + 1}. ${quote.quoteNumber} - ${quote.totalAmount}€`);
      console.log(`   Artiste: ${quote.tattooArtistId?.name || 'Inconnu'} (${quote.tattooArtistId?._id})`);
      console.log(`   Client: ${quote.clientId?.name || 'Inconnu'} (${quote.clientId?._id})`);
      console.log(`   Status: ${quote.status}`);
      console.log(`   ConversationId dans devis: ${quote.conversationId}`);
    });

    // 2. Pour chaque devis, vérifier s'il y a une conversation entre l'artiste et le client
    console.log('\n🔍 Vérification des conversations:');
    for (const quote of quotes) {
      if (!quote.tattooArtistId || !quote.clientId) {
        console.log(`❌ Devis ${quote.quoteNumber}: données manquantes`);
        continue;
      }

      const conversation = await Conversation.findOne({
        $and: [
          { 'participants.userId': quote.tattooArtistId._id },
          { 'participants.userId': quote.clientId._id }
        ]
      });

      console.log(`\n📋 Devis ${quote.quoteNumber}:`);
      console.log(`   Artiste: ${quote.tattooArtistId.name} (${quote.tattooArtistId._id})`);
      console.log(`   Client: ${quote.clientId.name} (${quote.clientId._id})`);
      
      if (conversation) {
        console.log(`   ✅ Conversation trouvée: ${conversation._id}`);
        console.log(`   📅 Dernière activité: ${conversation.lastActivity}`);
        
        // Vérifier les messages récents dans cette conversation
        const recentMessages = await Message.find({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate('senderId', 'name');
          
        console.log(`   💬 Messages récents (${recentMessages.length}):`);
        recentMessages.forEach(msg => {
          const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
          console.log(`     - ${msg.senderId?.name}: ${preview} (${msg.type})`);
        });
      } else {
        console.log(`   ❌ Aucune conversation trouvée`);
        
        // Lister toutes les conversations de l'artiste
        const artistConversations = await Conversation.find({
          'participants.userId': quote.tattooArtistId._id
        }).populate('participants.userId', 'name role');
        
        console.log(`   🔍 Conversations de l'artiste (${artistConversations.length}):`);
        artistConversations.forEach(conv => {
          const participants = conv.participants.map(p => `${p.userId.name} (${p.role})`).join(', ');
          console.log(`     - ${conv._id}: ${participants}`);
        });
      }
    }

    // 3. Simuler l'envoi d'un devis (sans vraiment envoyer)
    if (quotes.length > 0) {
      const testQuote = quotes[0];
      if (testQuote.tattooArtistId && testQuote.clientId) {
        console.log(`\n🧪 Test simulation envoi devis ${testQuote.quoteNumber}:`);
        
        const conversation = await Conversation.findOne({
          $and: [
            { 'participants.userId': testQuote.tattooArtistId._id },
            { 'participants.userId': testQuote.clientId._id }
          ]
        });
        
        if (conversation) {
          console.log(`✅ Conversation cible trouvée: ${conversation._id}`);
          console.log(`💬 Le message de devis serait envoyé dans cette conversation`);
          
          // Format du message qui serait créé
          const quoteMessage = `📋 **Nouveau Devis ${testQuote.quoteNumber}**

💰 Montant : ${testQuote.totalAmount.toFixed(2)} €
📅 Valable jusqu'au : ${testQuote.validUntil ? new Date(testQuote.validUntil).toLocaleDateString('fr-FR') : 'Non défini'}

🔗 Voir le devis : http://localhost:5000/api/quotes/${testQuote._id}/view
📄 Télécharger PDF : http://localhost:5000/api/quotes/${testQuote._id}/pdf

Pour accepter ou refuser ce devis, répondez par "ACCEPTER" ou "REFUSER".`;

          console.log('\n📝 Aperçu du message qui serait envoyé:');
          console.log('---');
          console.log(quoteMessage);
          console.log('---');
        } else {
          console.log(`❌ Aucune conversation trouvée pour ce devis`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

testQuoteSend();
