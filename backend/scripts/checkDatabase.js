require('dotenv').config();
const mongoose = require('mongoose');
const Quote = require('../models/Quote');
const Project = require('../models/Project');
const ClientProfile = require('../models/ClientProfile');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie\n');

    // Vérifier les devis
    const quotes = await Quote.find().sort({ createdAt: -1 }).limit(5);
    console.log(`📋 Derniers devis (${quotes.length}) :`);
    quotes.forEach(quote => {
      console.log(`  - ${quote.quoteNumber}: ${quote.status} (${quote.subtotal}€)`);
    });

    // Vérifier les projets
    const projects = await Project.find().sort({ createdAt: -1 }).limit(5);
    console.log(`\n📁 Projets créés (${projects.length}) :`);
    projects.forEach(project => {
      console.log(`  - ${project.projectNumber}: ${project.title} (${project.status})`);
    });

    // Vérifier les fiches clients
    const clients = await ClientProfile.find().sort({ createdAt: -1 }).limit(5);
    console.log(`\n👤 Fiches clients (${clients.length}) :`);
    clients.forEach(client => {
      console.log(`  - ${client.prenom} ${client.nom} (${client.email}) - ${client.projets.length} projets`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
