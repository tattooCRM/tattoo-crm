const axios = require('axios');

// Script pour tester l'envoi de devis via l'API
async function testSendQuoteAPI() {
  try {
    console.log('🔐 Tentative de connexion...');
    
    // 1. Se connecter en tant que Clément (tatoueur)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'clemvanker@gmail.com', // Email de Clément
      password: 'root'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token obtenu');
    
    // 2. Récupérer la liste des devis
    const quotesResponse = await axios.get('http://localhost:5000/api/quotes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const quotes = quotesResponse.data.quotes;
    console.log(`📋 ${quotes.length} devis trouvés`);
    
    if (quotes.length === 0) {
      console.log('❌ Aucun devis disponible pour le test');
      return;
    }
    
    // 3. Prendre le premier devis et tenter de l'envoyer
    const testQuote = quotes[0];
    console.log(`\n🧪 Test avec le devis: ${testQuote.quoteNumber}`);
    console.log(`   Client: ${testQuote.clientId?.name}`);
    console.log(`   Montant: ${testQuote.totalAmount}€`);
    console.log(`   Status actuel: ${testQuote.status}`);
    
    // 4. Envoyer le devis
    console.log('\n📤 Envoi du devis...');
    const sendResponse = await axios.post(
      `http://localhost:5000/api/quotes/${testQuote._id}/send`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    );
    
    console.log('✅ Devis envoyé avec succès !');
    console.log('📊 Réponse:', sendResponse.data.message);
    
    // 5. Vérifier que le message a bien été créé dans la conversation
    setTimeout(async () => {
      try {
        const conversationsResponse = await axios.get('http://localhost:5000/api/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n💬 Vérification des conversations...');
        const conversations = conversationsResponse.data.conversations || [];
        
        if (conversations.length > 0) {
          const conversation = conversations[0];
          console.log(`📞 Conversation ID: ${conversation._id}`);
          
          // Récupérer les messages de la conversation
          const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const messages = messagesResponse.data.messages || [];
          
          // Chercher les messages les plus récents
          console.log(`💬 ${messages.length} messages dans la conversation`);
          
          // Afficher les 3 derniers messages pour debug
          console.log('\n� 3 derniers messages:');
          messages.slice(0, 3).forEach((msg, index) => {
            console.log(`${index + 1}. Type: ${msg.type}, Par: ${msg.senderId?.name || msg.senderId}`);
            console.log(`   Créé: ${new Date(msg.createdAt).toLocaleString('fr-FR')}`);
            console.log(`   Contenu: ${msg.content.substring(0, 100)}...`);
            console.log(`   Metadata:`, msg.metadata);
            console.log('');
          });
          
          // Chercher le message de devis le plus récent
          const quoteMessages = messages.filter(msg => 
            msg.content && (msg.content.includes('Nouveau Devis') || msg.type === 'quote')
          );
          
          if (quoteMessages.length > 0) {
            const latestQuoteMessage = quoteMessages[0];
            console.log('\n✅ Message de devis trouvé !');
            console.log('📅 Créé le:', new Date(latestQuoteMessage.createdAt).toLocaleString('fr-FR'));
            console.log('📝 Contenu:');
            console.log('---');
            console.log(latestQuoteMessage.content);
            console.log('---');
            console.log('🎯 Type:', latestQuoteMessage.type);
            console.log('📊 Metadata:', latestQuoteMessage.metadata);
          } else {
            console.log('❌ Aucun message de devis trouvé dans la conversation');
          }
        } else {
          console.log('❌ Aucune conversation trouvée');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.response?.data || error.message);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testSendQuoteAPI();
