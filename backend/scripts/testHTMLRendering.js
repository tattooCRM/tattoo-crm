const axios = require('axios');

// Script pour tester le rendu HTML des devis
async function testHTMLQuoteRendering() {
  try {
    console.log('🔐 Connexion...');
    
    // Se connecter en tant que Clément
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'clemvanker@gmail.com',
      password: 'root'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Récupérer les conversations
    const conversationsResponse = await axios.get('http://localhost:5000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.conversations;
    if (conversations.length === 0) {
      console.log('❌ Aucune conversation trouvée');
      return;
    }
    
    const conversation = conversations[0];
    console.log('📞 Test sur conversation:', conversation._id);
    
    // Récupérer les messages de la conversation
    const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const messages = messagesResponse.data.messages || [];
    console.log(`\n💬 ${messages.length} messages dans la conversation`);
    
    // Chercher tous les messages de type devis
    const quoteMessages = messages.filter(msg => msg.type === 'quote');
    console.log(`📋 ${quoteMessages.length} messages de devis trouvés`);
    
    if (quoteMessages.length === 0) {
      console.log('❌ Aucun message de devis trouvé');
      return;
    }
    
    // Analyser chaque message de devis
    quoteMessages.forEach((msg, index) => {
      console.log(`\n🔍 Message de devis ${index + 1}:`);
      console.log('- ID:', msg._id);
      console.log('- Date:', new Date(msg.createdAt).toLocaleString('fr-FR'));
      console.log('- Type:', msg.metadata?.messageType || 'undefined');
      
      if (msg.metadata?.messageType === 'html_quote') {
        console.log('✅ Format HTML détecté');
        
        // Analyser le contenu HTML
        const content = msg.content;
        const checks = {
          hasGradient: content.includes('linear-gradient'),
          hasButtons: content.includes('onclick="handleQuoteAction'),
          hasStyling: content.includes('style='),
          hasQuoteNumber: content.includes('DEV-'),
          hasAmount: content.includes('€'),
          hasActions: ['accept', 'decline', 'view', 'download'].some(action => 
            content.includes(`'${action}_quote'`)
          )
        };
        
        console.log('📊 Analyse du contenu HTML:');
        console.log('  - Gradient:', checks.hasGradient ? '✅' : '❌');
        console.log('  - Boutons interactifs:', checks.hasButtons ? '✅' : '❌');
        console.log('  - Styles CSS:', checks.hasStyling ? '✅' : '❌');
        console.log('  - Numéro de devis:', checks.hasQuoteNumber ? '✅' : '❌');
        console.log('  - Montant:', checks.hasAmount ? '✅' : '❌');
        console.log('  - Actions boutons:', checks.hasActions ? '✅' : '❌');
        
        // Score de qualité
        const score = Object.values(checks).filter(Boolean).length;
        console.log(`📈 Score de qualité: ${score}/6`);
        
        if (score === 6) {
          console.log('🎉 Message HTML parfait !');
        } else if (score >= 4) {
          console.log('✅ Message HTML correct');
        } else {
          console.log('⚠️ Message HTML incomplet');
        }
        
      } else if (msg.metadata?.messageType === 'interactive_quote') {
        console.log('⚠️ Ancien format interactif (texte + boutons)');
      } else {
        console.log('❓ Format non identifié');
      }
    });
    
    // Test de création d'un nouveau devis HTML
    console.log('\n🆕 Création d\'un nouveau devis pour test...');
    
    const clientParticipant = conversation.participants.find(p => p.role === 'client');
    if (!clientParticipant) {
      console.log('❌ Aucun client trouvé');
      return;
    }
    
    const quoteData = {
      conversationId: conversation._id,
      clientId: clientParticipant.userId._id,
      title: 'Test Rendu HTML Visuel',
      items: [
        {
          description: 'Tatouage réaliste noir et blanc',
          quantity: 1,
          unitPrice: 350
        },
        {
          description: 'Retouches incluses',
          quantity: 1,
          unitPrice: 50
        }
      ],
      notes: 'Test du rendu visuel HTML avec plusieurs items',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 20
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/quotes', quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newQuote = createResponse.data.quote;
    console.log('✅ Nouveau devis créé:', newQuote.quoteNumber);
    
    // Envoyer le devis
    await axios.post(`http://localhost:5000/api/quotes/${newQuote._id}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis envoyé avec succès');
    console.log('\n🎯 Vous pouvez maintenant vérifier le rendu visuel dans l\'interface chat !');
    console.log('📱 URL frontend: http://localhost:5174 (si démarré)');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testHTMLQuoteRendering();
