const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test complet du workflow de devis
async function testCompleteQuoteWorkflow() {
  try {
    console.log('🧪 Test complet du workflow de devis...\n');
    
    // 1. Connexion avec le compte test
    console.log('1. Connexion...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@tatoueur.com',
      password: 'tattoo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // 2. Création d'un devis de test
    console.log('\n2. Création du devis...');
    const quoteData = {
      clientName: 'Marie Dupont',
      clientEmail: 'marie.dupont@example.com',
      clientPhone: '0123456789',
      tattooDescription: 'Tatouage fleur de lotus sur l\'avant-bras',
      placement: 'Avant-bras gauche',
      size: 'Moyen (8-12cm)',
      style: 'Minimaliste',
      colorPreference: 'Noir et blanc',
      services: [
        {
          name: 'Design personnalisé',
          description: 'Création du design de fleur de lotus',
          price: 100,
          quantity: 1
        },
        {
          name: 'Séance de tatouage',
          description: 'Réalisation du tatouage (durée estimée: 2-3h)',
          price: 300,
          quantity: 1
        }
      ],
      depositRequired: 100,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      notes: 'Premier tatouage de la cliente, prévoir plus de temps pour les explications'
    };
    
    const createResponse = await axios.post(`${API_BASE}/quotes`, quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const quoteId = createResponse.data.quote._id;
    console.log('✅ Devis créé:', {
      id: quoteId,
      quoteNumber: createResponse.data.quote.quoteNumber,
      status: createResponse.data.quote.status,
      totalAmount: createResponse.data.quote.totalAmount
    });
    
    // 3. Récupération du devis
    console.log('\n3. Récupération du devis...');
    const getResponse = await axios.get(`${API_BASE}/quotes/${quoteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis récupéré:', {
      quoteNumber: getResponse.data.quote.quoteNumber,
      status: getResponse.data.quote.status,
      clientName: getResponse.data.quote.clientInfo?.name,
      totalAmount: getResponse.data.quote.totalAmount
    });
    
    // 4. Envoi du devis
    console.log('\n4. Envoi du devis...');
    const sendResponse = await axios.post(`${API_BASE}/quotes/${quoteId}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis envoyé:', {
      status: sendResponse.data.quote.status,
      sentAt: sendResponse.data.quote.sentAt
    });
    
    // 5. Test du PDF du devis
    console.log('\n5. Test du PDF...');
    const pdfResponse = await axios.get(`${API_BASE}/quotes/${quoteId}/view-pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ PDF généré:', {
      size: pdfResponse.data.byteLength + ' bytes',
      contentType: pdfResponse.headers['content-type']
    });
    
    // 6. Acceptation du devis
    console.log('\n6. Acceptation du devis...');
    const acceptResponse = await axios.post(`${API_BASE}/quotes/${quoteId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Devis accepté:', {
      status: acceptResponse.data.quote.status,
      projectId: acceptResponse.data.project?._id,
      clientProfileId: acceptResponse.data.clientProfile?._id
    });
    
    // 7. Liste des devis
    console.log('\n7. Liste des devis...');
    const listResponse = await axios.get(`${API_BASE}/quotes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Liste récupérée:', {
      total: listResponse.data.total,
      quotesCount: listResponse.data.quotes.length
    });
    
    console.log('\n🎉 Workflow complet testé avec succès !');
    
    return {
      quoteId,
      quoteNumber: createResponse.data.quote.quoteNumber,
      projectId: acceptResponse.data.project?._id,
      clientProfileId: acceptResponse.data.clientProfile?._id
    };
    
  } catch (error) {
    console.error('❌ Erreur dans le workflow:');
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
  testCompleteQuoteWorkflow()
    .then((result) => {
      console.log('\n✅ Test terminé avec succès !');
      console.log('Résultat:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error.message);
      process.exit(1);
    });
}

module.exports = { testCompleteQuoteWorkflow };
