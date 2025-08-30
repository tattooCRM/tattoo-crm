const axios = require('axios');

// Script pour créer et envoyer un nouveau devis
async function testNewQuote() {
  try {
    console.log('🔐 Connexion...');
    
    // Se connecter en tant que Clément
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'clemvanker@gmail.com',
      password: 'root'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Récupérer les conversations pour trouver clientId et conversationId
    const conversationsResponse = await axios.get('http://localhost:5000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.conversations;
    if (conversations.length === 0) {
      console.log('❌ Aucune conversation trouvée');
      return;
    }
    
    const conversation = conversations[0];
    const clientParticipant = conversation.participants.find(p => p.role === 'client');
    
    if (!clientParticipant) {
      console.log('❌ Aucun client trouvé dans la conversation');
      return;
    }
    
    console.log('📞 Conversation:', conversation._id);
    console.log('👤 Client:', clientParticipant.userId.name);
    
    // Créer un nouveau devis
    const quoteData = {
      conversationId: conversation._id,
      clientId: clientParticipant.userId._id,
      title: 'Test Devis Format HTML',
      items: [
        {
          description: 'Tatouage de test avec nouveau format',
          quantity: 1,
          unitPrice: 250
        }
      ],
      notes: 'Devis de test pour vérifier le nouveau format HTML stylé',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      taxRate: 0
    };
    
    console.log('\n📋 Création du devis...');
    const createResponse = await axios.post('http://localhost:5000/api/quotes', quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newQuote = createResponse.data.quote;
    console.log('✅ Devis créé:', newQuote.quoteNumber);
    console.log('💰 Montant:', newQuote.totalAmount, '€');
    
    // Envoyer le devis
    console.log('\n📤 Envoi du devis...');
    const sendResponse = await axios.post(`http://localhost:5000/api/quotes/${newQuote._id}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis envoyé !');
    
    // Vérifier le message dans la conversation
    setTimeout(async () => {
      try {
        const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const messages = messagesResponse.data.messages || [];
        console.log(`\n💬 ${messages.length} messages dans la conversation`);
        
        // Chercher le dernier message de devis créé (pas le premier dans la liste)
        const quoteMessages = messages.filter(msg => msg.type === 'quote');
        const latestMessage = quoteMessages.find(msg => 
          msg.content.includes(newQuote.quoteNumber) || 
          msg.metadata?.quoteId === newQuote._id
        ) || messages[0];
        if (latestMessage) {
          console.log('\n📝 Dernier message:');
          console.log('Type:', latestMessage.type);
          console.log('Date:', new Date(latestMessage.createdAt).toLocaleString('fr-FR'));
          console.log('MessageType:', latestMessage.metadata?.messageType || 'undefined');
          
          // Afficher un aperçu du contenu (premiers 200 caractères)
          console.log('\nContenu (aperçu):');
          console.log('---');
          console.log(latestMessage.content.substring(0, 200) + '...');
          console.log('---');
          
          // Vérifier le format du message
          if (latestMessage.metadata?.messageType === 'html_quote' && latestMessage.content.includes('<div style')) {
            console.log('\n🎉 SUCCESS! Le nouveau format HTML fonctionne !');
            console.log('✅ Message de type html_quote détecté');
            console.log('✅ Contenu HTML avec styles détecté');
            
            // Vérifier la présence des boutons
            if (latestMessage.content.includes('onclick="handleQuoteAction')) {
              console.log('✅ Boutons interactifs détectés');
            } else {
              console.log('⚠️ Boutons interactifs manquants');
            }
            
            // Vérifier la présence du gradient
            if (latestMessage.content.includes('linear-gradient')) {
              console.log('✅ Styles de gradient détectés');
            }
            
            // Vérifier la présence des informations du devis
            if (latestMessage.content.includes(newQuote.quoteNumber)) {
              console.log('✅ Numéro de devis présent dans le HTML');
            }
            
          } else if (latestMessage.content.includes('📋 **Nouveau Devis')) {
            console.log('\n⚠️ ATTENTION: Ancien format texte détecté - devrait être HTML !');
            console.log('❌ Le format HTML n\'est pas appliqué correctement');
          } else {
            console.log('\n❌ Format de message non reconnu');
            console.log('Type de message:', latestMessage.metadata?.messageType);
            console.log('Contient HTML:', latestMessage.content.includes('<div'));
          }
          
          console.log('\n📊 Résumé du test:');
          console.log('- Devis créé:', newQuote.quoteNumber);
          console.log('- Message envoyé:', latestMessage.type);
          console.log('- Format message:', latestMessage.metadata?.messageType || 'undefined');
          console.log('- Contient HTML:', latestMessage.content.includes('<div') ? 'OUI' : 'NON');
          console.log('- Contient boutons:', latestMessage.content.includes('onclick') ? 'OUI' : 'NON');
        }
        
      } catch (error) {
        console.error('❌ Erreur vérification:', error.response?.data || error.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testNewQuote();
