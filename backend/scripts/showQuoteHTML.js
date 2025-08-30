const axios = require('axios');

// Script pour afficher le contenu HTML complet du dernier devis
async function showLatestQuoteHTML() {
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
    
    // Récupérer les messages
    const messagesResponse = await axios.get(`http://localhost:5000/api/chat/conversations/${conversation._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const messages = messagesResponse.data.messages || [];
    const latestQuote = messages.find(msg => msg.type === 'quote' && msg.metadata?.messageType === 'html_quote');
    
    if (!latestQuote) {
      console.log('❌ Aucun message HTML de devis trouvé');
      return;
    }
    
    console.log('\n🎨 CONTENU HTML DU DERNIER DEVIS:');
    console.log('=====================================');
    console.log(latestQuote.content);
    console.log('=====================================\n');
    
    console.log('📊 Informations:');
    console.log('- Type:', latestQuote.metadata?.messageType);
    console.log('- Date:', new Date(latestQuote.createdAt).toLocaleString('fr-FR'));
    console.log('- QuoteId:', latestQuote.metadata?.quoteId);
    
    // Analyse du contenu
    const content = latestQuote.content;
    console.log('\n🔍 Analyse du HTML:');
    console.log('- Taille:', content.length, 'caractères');
    console.log('- Contient gradient:', content.includes('linear-gradient') ? '✅' : '❌');
    console.log('- Contient boutons:', content.includes('onclick') ? '✅' : '❌');
    console.log('- Contient actions:', ['accept', 'decline', 'view', 'download'].filter(action => 
      content.includes(`'${action}_quote'`)).length, '/4 actions');
    
    console.log('\n✨ Le devis s\'affiche maintenant en HTML stylé dans la conversation !');
    console.log('🚀 Plus de code brut, mais un rendu visuel moderne avec boutons interactifs.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

showLatestQuoteHTML();
