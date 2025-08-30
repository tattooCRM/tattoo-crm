const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFrontendFixes() {
  try {
    console.log('🧪 Test des corrections frontend...\n');
    
    // 1. Test de connexion
    console.log('1. Test connexion...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@tatoueur.com',
      password: 'tattoo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // 2. Test endpoint revenue
    console.log('\n2. Test endpoint revenue...');
    const revenueResponse = await axios.get(`${API_BASE}/quotes/revenue?month=8&year=2025`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Revenue endpoint:', {
      revenue: revenueResponse.data.revenue,
      quotesCount: revenueResponse.data.quotesCount,
      period: revenueResponse.data.period
    });
    
    // 3. Test création devis format frontend
    console.log('\n3. Test création devis format frontend...');
    const frontendQuoteData = {
      title: 'Devis Tatouage',
      clientInfo: {
        name: 'Jean Client',
        email: 'jean.client@example.com',
        phone: '0123456789',
        address: {
          street: '123 rue Test',
          city: 'Paris',
          zipCode: '75000',
          country: 'France'
        }
      },
      artistInfo: {
        name: 'Artiste Test',
        email: 'artiste@test.com',
        phone: '0987654321'
      },
      items: [
        {
          description: 'Tatouage dragon',
          quantity: 1,
          unitPrice: 200,
          totalPrice: 200
        }
      ],
      subtotal: 200,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 200,
      notes: 'Test depuis le frontend',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      conversationId: null,
      clientId: null
    };
    
    const createResponse = await axios.post(`${API_BASE}/quotes`, frontendQuoteData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Devis créé depuis format frontend:', {
      id: createResponse.data.quote._id,
      quoteNumber: createResponse.data.quote.quoteNumber,
      clientName: createResponse.data.quote.clientInfo?.name,
      totalAmount: createResponse.data.quote.totalAmount
    });
    
    console.log('\n🎉 Tous les tests réussis !');
    
  } catch (error) {
    console.error('❌ Erreur dans le test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Exécuter le test
if (require.main === module) {
  testFrontendFixes()
    .then(() => {
      console.log('\n✅ Test terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error.message);
      process.exit(1);
    });
}

module.exports = { testFrontendFixes };
