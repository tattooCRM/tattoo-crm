const axios = require('axios');

async function testHTMLQuote() {
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
    
    const conversations = conversationsResponse.data.conversations;
    const conversation = conversations[0];
    const clientParticipant = conversation.participants.find(p => p.role === 'client');
    
    console.log('📞 Conversation:', conversation._id);
    console.log('👤 Client:', clientParticipant.userId.name);
    
    // Créer un nouveau devis avec HTML
    const quoteData = {
      conversationId: conversation._id,
      clientId: clientParticipant.userId._id,
      title: 'Test Devis HTML Stylé',
      items: [
        {
          description: 'Tatouage Dragon Japonais',
          quantity: 1,
          unitPrice: 350
        },
        {
          description: 'Retouches et détails',
          quantity: 1,
          unitPrice: 50
        }
      ],
      notes: 'Design personnalisé avec couleurs vibrantes',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      taxRate: 0
    };
    
    console.log('\n📋 Création du devis HTML...');
    const createResponse = await axios.post('http://localhost:5000/api/quotes', quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newQuote = createResponse.data.quote;
    console.log('✅ Devis créé:', newQuote.quoteNumber);
    console.log('💰 Montant:', newQuote.totalAmount, '€');
    
    // Envoyer le devis (doit maintenant utiliser le format HTML)
    console.log('\n📤 Envoi du devis HTML...');
    const sendResponse = await axios.post(`http://localhost:5000/api/quotes/${newQuote._id}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis HTML envoyé !');
    
    // Attendre un peu puis vérifier le message dans la base
    setTimeout(async () => {
      try {
        console.log('\n🔍 Vérification du message HTML dans la base...');
        
        // Appel direct à la base via script
        const { exec } = require('child_process');
        exec('node scripts/checkLatestQuoteMessage.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            console.error('Erreur:', error);
            return;
          }
          
          console.log('\n📊 Résultat de la vérification:');
          console.log(stdout);
          
          // Rechercher les indices de format HTML
          if (stdout.includes('html_quote')) {
            console.log('🎉 SUCCESS! Message HTML détecté !');
          } else if (stdout.includes('interactive_quote')) {
            console.log('⚠️ Encore format texte, vérifier le cache/redémarrage');
          } else {
            console.log('❓ Format non déterminé');
          }
        });
        
      } catch (error) {
        console.error('❌ Erreur vérification:', error);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testHTMLQuote();
