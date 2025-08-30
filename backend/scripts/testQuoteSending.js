const axios = require('axios');

// Script pour tester l'envoi d'un devis avec le nouveau format HTML
async function testQuoteSending() {
  try {
    console.log('🔐 Connexion avec le compte tatoueur...');
    
    // Se connecter avec le compte tatoueur (Clément)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'clemvanker@gmail.com',
      password: 'tattoo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie (Tatoueur)');
    
    // Récupérer les conversations du tatoueur
    const conversationsResponse = await axios.get('http://localhost:5000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.conversations || [];
    console.log(`📞 ${conversations.length} conversations trouvées`);
    
    if (conversations.length === 0) {
      console.log('❌ Aucune conversation disponible pour tester');
      return;
    }
    
    const conversation = conversations[0];
    console.log(`🗨️ Test avec la conversation: ${conversation.id}`);
    
    // Trouver le client dans cette conversation
    const clientId = conversation.otherParticipantId || conversation.clientId;
    console.log('👤 Client ID:', clientId);
    
    // Créer un devis de test
    const quoteData = {
      conversationId: conversation.id,
      clientId: clientId,
      title: 'Tatouage Dragon Japonais',
      items: [
        {
          description: 'Tatouage dragon japonais style traditionnel',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350
        },
        {
          description: 'Séance de préparation et stencil',
          quantity: 1,
          unitPrice: 50,
          totalPrice: 50
        }
      ],
      notes: 'Ce tatouage nécessitera 2 séances. Première séance pour le contour, deuxième pour l\'ombrage et les détails.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      taxRate: 0
    };
    
    console.log('\n📋 Création du devis...');
    const createResponse = await axios.post('http://localhost:5000/api/quotes', quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newQuote = createResponse.data.quote;
    console.log('✅ Devis créé:', newQuote.quoteNumber);
    console.log('💰 Montant total:', newQuote.totalAmount, '€');
    
    // Envoyer le devis dans la conversation
    console.log('\n📤 Envoi du devis dans la conversation...');
    const sendResponse = await axios.post(`http://localhost:5000/api/quotes/${newQuote._id}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis envoyé dans la conversation !');
    console.log('Message de réponse:', sendResponse.data.message);
    
    // Vérifier que le message apparaît dans la conversation
    setTimeout(async () => {
      try {
        const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const messages = messagesResponse.data.messages || [];
        const latestMessage = messages[0]; // Le plus récent en premier
        
        console.log('\n📝 Dernier message dans la conversation:');
        console.log('- Type:', latestMessage.type);
        console.log('- Message Type:', latestMessage.metadata?.messageType);
        console.log('- Contient HTML:', latestMessage.content.includes('<div style'));
        console.log('- Aperçu (50 premiers caractères):', latestMessage.content.substring(0, 50) + '...');
        
        if (latestMessage.type === 'quote' && latestMessage.metadata?.messageType === 'html_quote') {
          console.log('\n🎯 LE DEVIS A ÉTÉ ENVOYÉ AVEC LE FORMAT HTML !');
          console.log('Le client devrait maintenant voir un beau devis stylé avec des boutons interactifs.');
        } else {
          console.log('\n❌ Problème: Le devis n\'a pas le bon format HTML');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.response?.data || error.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter le test
testQuoteSending();
