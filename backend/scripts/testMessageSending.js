const axios = require('axios');

// Script pour tester l'envoi de messages
async function testMessageSending() {
  try {
    console.log('🔐 Connexion avec le compte client...');
    
    // Se connecter avec le compte client
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'tattoo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Récupérer les conversations
    const conversationsResponse = await axios.get('http://localhost:5000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.conversations || [];
    console.log(`📞 ${conversations.length} conversations trouvées`);
    
    if (conversations.length === 0) {
      console.log('❌ Aucune conversation disponible pour tester');
      return;
    }
    
    const firstConversation = conversations[0];
    console.log(`🗨️ Test avec la conversation: ${firstConversation.id}`);
    
    // Envoyer un message de test
    const messageResponse = await axios.post(
      `http://localhost:5000/api/chat/conversations/${firstConversation.id}/messages`,
      {
        content: 'Message de test depuis le script',
        type: 'text'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Message envoyé avec succès:', messageResponse.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter le test
testMessageSending();
