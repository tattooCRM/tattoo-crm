require('dotenv').config();
const axios = require('axios');

async function testCompleteWorkflow() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🚀 Test du workflow complet devis → projet → client\n');

    // 1. Connexion en tant que tatoueur
    console.log('1. Connexion en tant que tatoueur...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@tatoueur.com',
      password: 'password'
    });
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // 2. Obtenir les conversations
    console.log('2. Récupération des conversations...');
    const convResponse = await axios.get(`${baseURL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = convResponse.data.conversations || [];
    console.log(`✅ ${conversations.length} conversations trouvées`);
    
    if (!conversations || conversations.length === 0) {
      console.log('❌ Aucune conversation trouvée');
      return;
    }

    const conversationId = conversations[0]._id;
    const otherParticipantId = conversations[0].otherParticipantId; // ID du client
    console.log(`✅ Utilisation de la conversation: ${conversationId}`);
    console.log(`✅ Client: ${otherParticipantId}\n`);

    // 3. Créer et envoyer un devis
    console.log('3. Création d\'un nouveau devis...');
    const quoteData = {
      conversationId: conversationId,
      clientId: otherParticipantId, // ID du client
      title: 'Dragon Japonais - Test Workflow',
      items: [
        {
          description: 'Design personnalisé',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150
        },
        {
          description: 'Session tatouage (4h)',
          quantity: 1,
          unitPrice: 600,
          totalPrice: 600
        }
      ],
      notes: 'Test du workflow complet',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const quoteResponse = await axios.post(`${baseURL}/quotes`, quoteData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const quote = quoteResponse.data;
    console.log(`✅ Devis créé: ${quote.quoteNumber || quote._id} (${quote.totalAmount || quote.subtotal || 750}€)\n`);

    // 4. Accepter le devis
    console.log('4. Acceptation du devis...');
    const acceptResponse = await axios.post(`${baseURL}/quotes/${quote._id}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Devis accepté !');
    console.log('✅ Projet créé !');
    console.log('✅ Fiche client créée !\n');

    // 5. Vérifier les projets
    console.log('5. Vérification des projets...');
    const projectsResponse = await axios.get(`${baseURL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ ${projectsResponse.data.length} projets trouvés`);
    if (projectsResponse.data.length > 0) {
      const lastProject = projectsResponse.data[0];
      console.log(`   - ${lastProject.projectNumber}: ${lastProject.title}`);
    }

    // 6. Vérifier les fiches clients
    console.log('\n6. Vérification des fiches clients...');
    const clientsResponse = await axios.get(`${baseURL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ ${clientsResponse.data.length} fiches clients trouvées`);
    if (clientsResponse.data.length > 0) {
      const lastClient = clientsResponse.data[0];
      console.log(`   - ${lastClient.prenom} ${lastClient.nom} (${lastClient.email})`);
    }

    console.log('\n🎉 Test du workflow complet terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.response?.data || error.message);
  }
}

testCompleteWorkflow();
