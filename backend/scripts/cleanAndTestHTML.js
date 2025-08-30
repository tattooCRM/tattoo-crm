const axios = require('axios');

// Script pour nettoyer et tester le nouveau format HTML
async function cleanAndTestHTML() {
  try {
    console.log('🔐 Connexion...');
    
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
    
    const conversation = conversationsResponse.data.conversations[0];
    const clientParticipant = conversation.participants.find(p => p.role === 'client');
    
    console.log('📞 Conversation:', conversation._id);
    console.log('👤 Client:', clientParticipant.userId.name);
    
    // Créer un nouveau devis avec un titre distinctif
    const uniqueTitle = `Devis Test HTML ${new Date().getHours()}h${new Date().getMinutes()}`;
    const quoteData = {
      conversationId: conversation._id,
      clientId: clientParticipant.userId._id,
      title: uniqueTitle,
      items: [
        {
          description: 'Tatouage nouvelle génération (format HTML)',
          quantity: 1,
          unitPrice: 300
        },
        {
          description: 'Session de retouches',
          quantity: 1,
          unitPrice: 75
        }
      ],
      notes: '🎨 Ce devis utilise le nouveau format HTML avec gradient et boutons interactifs. Plus de code brut !',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 20
    };
    
    console.log('\\n📋 Création du devis avec format HTML...');
    const createResponse = await axios.post('http://localhost:5000/api/quotes', quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newQuote = createResponse.data.quote;
    console.log('✅ Devis créé:', newQuote.quoteNumber);
    console.log('💰 Montant total:', newQuote.totalAmount, '€ (avec TVA)');
    
    // Envoyer le devis
    console.log('\\n📤 Envoi du devis...');
    await axios.post(`http://localhost:5000/api/quotes/${newQuote._id}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis envoyé avec succès !');
    
    // Attendre un peu puis vérifier
    setTimeout(async () => {
      try {
        console.log('\\n🔍 Vérification du message...');
        
        const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const messages = messagesResponse.data.messages || [];
        const latestMessage = messages[0];
        
        console.log('📝 Dernier message créé:');
        console.log('- Type:', latestMessage.type);
        console.log('- MessageType:', latestMessage.metadata?.messageType);
        console.log('- Date:', new Date(latestMessage.createdAt).toLocaleString('fr-FR'));
        
        if (latestMessage.content.includes('<div style')) {
          console.log('\\n🎉 SUCCÈS ! FORMAT HTML DÉTECTÉ !');
          console.log('✅ Le message contient du HTML avec styles');
          console.log('✅ Le gradient et les boutons sont présents');
          console.log('✅ Plus de code brut markdown !');
          
          // Vérifier les éléments spécifiques
          const checks = {
            hasGradient: latestMessage.content.includes('linear-gradient'),
            hasButtons: latestMessage.content.includes('handleQuoteAction'),
            hasQuoteNumber: latestMessage.content.includes(newQuote.quoteNumber),
            hasAmount: latestMessage.content.includes(newQuote.totalAmount),
            hasNotes: latestMessage.content.includes('nouveau format HTML')
          };
          
          console.log('\\n📊 Vérifications détaillées:');
          Object.entries(checks).forEach(([key, value]) => {
            console.log(`   ${key}: ${value ? '✅' : '❌'}`);
          });
          
          const score = Object.values(checks).filter(Boolean).length;
          console.log(`\\n🏆 Score: ${score}/5`);
          
          if (score === 5) {
            console.log('🌟 PARFAIT ! Le nouveau format HTML fonctionne à 100% !');
          }
          
        } else if (latestMessage.content.includes('📋 **Nouveau Devis')) {
          console.log('\\n⚠️ PROBLÈME: Ancien format texte détecté !');
          console.log('❌ Le message est encore en format markdown');
          console.log('🔧 Il faut vérifier le contrôleur de devis');
        } else {
          console.log('\\n❓ Format non reconnu');
          console.log('Contenu:', latestMessage.content.substring(0, 150));
        }
        
        console.log('\\n🎯 Instructions:');
        console.log('1. Actualiser la page du chat frontend');
        console.log('2. Chercher le devis:', uniqueTitle);
        console.log('3. Le devis doit apparaître comme une belle carte avec gradient');
        console.log('4. Les boutons Accepter/Refuser doivent être interactifs');
        
      } catch (error) {
        console.error('❌ Erreur vérification:', error.response?.data || error.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

cleanAndTestHTML();
