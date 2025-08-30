const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Script pour récupérer les identifiants de connexion des comptes Ilona et Clément
async function getUserCredentials() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔍 Recherche des comptes Ilona et Clément...\n');

    // Chercher Ilona
    const ilona = await User.findOne({ 
      $or: [
        { slug: 'sushit' },
        { name: /ilona/i },
        { email: /ilona/i }
      ]
    });

    if (ilona) {
      console.log('👩 COMPTE ILONA:');
      console.log('  Email:', ilona.email);
      console.log('  Mot de passe (hasché):', ilona.password);
      console.log('  Nom:', ilona.name);
      console.log('  Slug:', ilona.slug);
      console.log('  Rôle:', ilona.role);
      console.log('');
    } else {
      console.log('❌ Compte Ilona non trouvé');
    }

    // Chercher Clément/Xiaotox
    const clement = await User.findOne({ 
      $or: [
        { slug: 'xiaotox' },
        { name: /clément/i },
        { name: /clement/i },
        { email: /clement/i },
        { email: /xiaotox/i }
      ]
    });

    if (clement) {
      console.log('👨 COMPTE CLÉMENT:');
      console.log('  Email:', clement.email);
      console.log('  Mot de passe (hasché):', clement.password);
      console.log('  Nom:', clement.name);
      console.log('  Slug:', clement.slug);
      console.log('  Rôle:', clement.role);
      console.log('');
    } else {
      console.log('❌ Compte Clément non trouvé');
    }

    // Lister tous les tatoueurs pour référence
    console.log('📋 TOUS LES TATOUEURS:');
    const tattooists = await User.find({ role: 'tattoo_artist' });
    tattooists.forEach((t, index) => {
      console.log(`  ${index + 1}. ${t.name} (${t.email}) - Slug: ${t.slug}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
getUserCredentials();
