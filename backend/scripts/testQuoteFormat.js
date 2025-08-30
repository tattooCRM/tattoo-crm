const axios = require('axios');

async function testQuoteFormat() {
  try {
    console.log('🔐 Test de connexion...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'clemvanker@gmail.com',
      password: 'root'
    });
    
    console.log('✅ Connexion réussie');
    const token = loginResponse.data.token;
    
    // Test simple : récupérer les devis existants
    const quotesResponse = await axios.get('http://localhost:5000/api/quotes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Devis disponibles:', quotesResponse.data.quotes.length);
    
    const quote = quotesResponse.data.quotes[0];
    if (quote) {
      console.log('🧪 Test devis:', quote.quoteNumber, quote.totalAmount, '€');
      
      // Test création d'un message de devis avec le nouveau format
      const quoteMessage = {
        text: `📋 **Nouveau Devis ${quote.quoteNumber}**

💰 **Montant total : ${quote.totalAmount.toFixed(2)} €**
📅 Valable jusqu'au : Test

📝 **Détails :**
• Test - 1x 200€ = 200€

💬 **Notes :** Test du nouveau format`,
        
        buttons: [
          {
            id: 'accept_quote',
            text: '✅ Accepter le devis',
            style: 'primary',
            action: 'accept_quote',
            data: { quoteId: quote._id }
          },
          {
            id: 'decline_quote', 
            text: '❌ Refuser le devis',
            style: 'secondary',
            action: 'decline_quote',
            data: { quoteId: quote._id }
          }
        ]
      };
      
      console.log('📝 Message formaté:');
      console.log('Texte:', quoteMessage.text.substring(0, 100) + '...');
      console.log('Boutons:', quoteMessage.buttons.length);
      
      console.log('✅ Format du message valide !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

testQuoteFormat();
