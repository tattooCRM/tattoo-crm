const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test de création de devis
async function testQuoteCreation() {
  try {
    console.log('🧪 Test de création de devis...\n');
    
    // 1. Connexion avec le compte test
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@tatoueur.com',
      password: 'tattoo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // 2. Création d'un devis de test
    const quoteData = {
      clientName: 'Client Test',
      clientEmail: 'client.test@example.com',
      clientPhone: '0123456789',
      tattooDescription: 'Tatouage dragon sur l\'épaule',
      placement: 'Épaule droite',
      size: 'Moyen (10-15cm)',
      style: 'Japonais',
      colorPreference: 'Couleur',
      services: [
        {
          name: 'Création du design',
          description: 'Conception personnalisée du tatouage',
          price: 150,
          quantity: 1
        },
        {
          name: 'Séance de tatouage',
          description: 'Réalisation du tatouage (durée estimée: 4h)',
          price: 400,
          quantity: 1
        }
      ],
      depositRequired: 100,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      notes: 'Prévoir 2 séances pour ce tatouage'
    };
    
    console.log('📝 Données du devis:', JSON.stringify(quoteData, null, 2));
    
    const createResponse = await axios.post(`${API_BASE}/quotes`, quoteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Devis créé avec succès!');
    console.log('📄 Devis créé:', {
      id: createResponse.data._id,
      quoteNumber: createResponse.data.quoteNumber,
      status: createResponse.data.status,
      clientName: createResponse.data.clientName,
      totalAmount: createResponse.data.totalAmount
    });
    
    return createResponse.data;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du devis:');
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
  testQuoteCreation()
    .then(() => {
      console.log('\n✅ Test terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error.message);
      process.exit(1);
    });
}

module.exports = { testQuoteCreation };
