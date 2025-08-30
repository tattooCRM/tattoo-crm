const mongoose = require('mongoose');
const Quote = require('../models/Quote');
require('dotenv').config();

// Script pour nettoyer les devis de test
async function cleanTestQuotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🧹 Nettoyage des devis de test...\n');

    // Supprimer tous les devis qui commencent par "DEV-202508"
    const result = await Quote.deleteMany({
      quoteNumber: { $regex: /^DEV-202508/ }
    });

    console.log(`✅ ${result.deletedCount} devis de test supprimés`);

    // Lister les devis restants
    const remainingQuotes = await Quote.find({}).select('quoteNumber title totalAmount createdAt');
    
    if (remainingQuotes.length > 0) {
      console.log('\n📋 Devis restants:');
      remainingQuotes.forEach(quote => {
        console.log(`- ${quote.quoteNumber}: ${quote.title} (${quote.totalAmount}€)`);
      });
    } else {
      console.log('\n📋 Aucun devis restant - Base propre !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le nettoyage
cleanTestQuotes();
