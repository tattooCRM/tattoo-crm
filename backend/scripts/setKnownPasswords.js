const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

// Script pour définir des mots de passe connus pour Ilona et Clément
async function setKnownPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔧 Mise à jour des mots de passe pour Ilona et Clément...\n');

    // Mot de passe simple pour les tests
    const newPassword = 'tattoo123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour Ilona
    const ilonaUpdate = await User.findOneAndUpdate(
      { email: 'ilona.faynn@gmail.com' },
      { 
        password: hashedPassword,
        slug: 'sushit',
        role: 'tattoo_artist',
        specialty: 'Sushi Art, Kawaii, Japonais, Minimaliste',
        bio: 'Artiste tatoueur spécialisée dans l\'art japonais et les designs kawaii.',
        instagram: 'sushit_tattoo',
        isPublicPageActive: true
      },
      { new: true }
    );

    if (ilonaUpdate) {
      console.log('✅ COMPTE ILONA mis à jour:');
      console.log('  Email: ilona.faynn@gmail.com');
      console.log('  Mot de passe: tattoo123');
      console.log('  Slug: sushit');
      console.log('  Rôle: tattoo_artist');
      console.log('');
    }

    // Mettre à jour Clément
    const clementUpdate = await User.findOneAndUpdate(
      { email: 'clemvanker@gmail.com' },
      { 
        password: hashedPassword,
        slug: 'xiaotox',
        specialty: 'Style moderne, géométrique, blackwork',
        bio: 'Tatoueur spécialisé dans les designs modernes et géométriques.',
        instagram: 'xiaotox_tattoo',
        isPublicPageActive: true
      },
      { new: true }
    );

    if (clementUpdate) {
      console.log('✅ COMPTE CLÉMENT mis à jour:');
      console.log('  Email: clemvanker@gmail.com');
      console.log('  Mot de passe: tattoo123');
      console.log('  Slug: xiaotox');
      console.log('  Rôle: tattoo_artist');
      console.log('');
    }

    console.log('🎯 IDENTIFIANTS DE CONNEXION:');
    console.log('-----------------------------');
    console.log('ILONA (Sushit):');
    console.log('  Email: ilona.faynn@gmail.com');
    console.log('  Mot de passe: tattoo123');
    console.log('');
    console.log('CLÉMENT (Xiaotox):');
    console.log('  Email: clemvanker@gmail.com');
    console.log('  Mot de passe: tattoo123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
setKnownPasswords();
