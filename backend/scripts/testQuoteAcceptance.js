require('dotenv').config();
const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Quote = require('../models/Quote');
const Project = require('../models/Project');
const ClientProfile = require('../models/ClientProfile');

async function testQuoteAcceptance() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Trouver le dernier devis créé
    const latestQuote = await Quote.findOne().sort({ createdAt: -1 });
    if (!latestQuote) {
      console.log('❌ Aucun devis trouvé');
      return;
    }

    console.log(`📋 Devis trouvé: ${latestQuote.quoteNumber} (${latestQuote.status})`);

    if (latestQuote.status !== 'sent') {
      console.log(`⚠️  Devis non envoyé ou déjà traité (status: ${latestQuote.status})`);
      return;
    }

    // Simuler l'acceptation du devis
    latestQuote.status = 'accepted';
    latestQuote.acceptedAt = new Date();
    await latestQuote.save();
    console.log('✅ Devis accepté');

    // Générer un numéro de projet unique
    const projectNumber = `PROJ-${Date.now().toString().slice(-8).toUpperCase()}`;

    // Créer le projet avec tous les champs requis
    const project = new Project({
      projectNumber: projectNumber,
      title: `Projet Tatouage - ${latestQuote.quoteNumber}`,
      description: `Projet créé automatiquement suite à l'acceptation du devis ${latestQuote.quoteNumber}`,
      tattooArtistId: latestQuote.tattooArtistId,
      clientId: latestQuote.clientId,
      quoteId: latestQuote._id,
      conversationId: latestQuote.conversationId,
      style: 'japanese', // Style par défaut basé sur le test
      bodyZone: 'arm', // Zone par défaut basée sur le test
      size: 'large', // Taille par défaut
      estimatedDuration: 6, // 6 heures basé sur le devis test
      status: 'pending', // Status valide
      totalAmount: latestQuote.subtotal
    });
    
    await project.save();
    console.log(`✅ Projet créé: ${project._id}`);

    // Créer ou mettre à jour le profil client
    let clientProfile = await ClientProfile.findOne({ email: latestQuote.clientEmail });
    
    if (!clientProfile) {
      clientProfile = new ClientProfile({
        email: latestQuote.clientEmail,
        nom: 'Client',
        prenom: 'Test',
        telephone: '+33 6 12 34 56 78',
        notes: `Client créé automatiquement suite à l'acceptation du devis ${latestQuote.quoteNumber}`,
        tattooArtistId: latestQuote.tattooArtistId,
        projets: [project._id]
      });
    } else {
      clientProfile.projets.push(project._id);
    }
    
    await clientProfile.save();
    console.log(`✅ Fiche client ${clientProfile ? 'mise à jour' : 'créée'}: ${clientProfile._id}`);

    // Ajouter un message de confirmation dans la conversation
    const conversation = await Chat.findById(latestQuote.conversationId);
    if (conversation) {
      const confirmationMessage = {
        sender: 'system',
        message: `✅ Devis ${latestQuote.quoteNumber} accepté ! 
        
🎉 Félicitations ! Votre projet de tatouage est maintenant confirmé.
📋 Numéro de projet: ${project._id.toString().slice(-8).toUpperCase()}
💰 Budget: ${latestQuote.subtotal} EUR

Nous allons vous contacter prochainement pour organiser les détails de votre tatouage.`,
        messageType: 'text',
        timestamp: new Date()
      };

      conversation.messages.push(confirmationMessage);
      await conversation.save();
      console.log('✅ Message de confirmation ajouté à la conversation');
    }

    console.log('\n🎉 Test d\'acceptation de devis terminé avec succès !');
    console.log(`📋 Devis: ${latestQuote.quoteNumber}`);
    console.log(`📁 Projet: ${project.title}`);
    console.log(`👤 Client: ${clientProfile.email}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testQuoteAcceptance();
