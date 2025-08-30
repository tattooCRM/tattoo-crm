const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

// Script pour créer les comptes Ilona et Clément avec les bonnes informations
async function createAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔧 Création/Mise à jour des comptes Ilona et Clément...\n');

    // Mot de passe simple pour les tests
    const password = 'tattoo123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supprimer les anciens comptes s'ils existent
    await User.deleteMany({ 
      $or: [
        { email: 'ilona.faynn@gmail.com' },
        { email: 'clemvanker@gmail.com' }
      ]
    });

    // Créer le compte Ilona (tatoueur)
    const ilona = new User({
      name: 'Ilona',
      email: 'ilona.faynn@gmail.com',
      password: hashedPassword,
      role: 'tattoo_artist',
      slug: 'sushit',
      specialty: 'Sushi Art, Kawaii, Japonais, Minimaliste',
      bio: 'Artiste tatoueur spécialisée dans l\'art japonais et les designs kawaii. Passionnée par les motifs délicats et colorés.',
      instagram: 'sushit_tattoo',
      isPublicPageActive: true
    });

    await ilona.save();
    console.log('✅ COMPTE ILONA créé:');
    console.log('  Email: ilona.faynn@gmail.com');
    console.log('  Mot de passe: tattoo123');
    console.log('  Rôle: tattoo_artist');
    console.log('  Slug: sushit');
    console.log('');

    // Créer le compte Clément (tatoueur)
    const clement = new User({
      name: 'Clément',
      email: 'clemvanker@gmail.com',
      password: hashedPassword,
      role: 'tattoo_artist',
      slug: 'xiaotox',
      specialty: 'Style moderne, géométrique, blackwork',
      bio: 'Tatoueur spécialisé dans les designs modernes et géométriques.',
      instagram: 'xiaotox_tattoo',
      isPublicPageActive: true
    });

    await clement.save();
    console.log('✅ COMPTE CLÉMENT créé:');
    console.log('  Email: clemvanker@gmail.com');
    console.log('  Mot de passe: tattoo123');
    console.log('  Rôle: tattoo_artist');
    console.log('  Slug: xiaotox');
    console.log('');

    // Créer aussi un compte client de test
    const client = new User({
      name: 'Client Test',
      email: 'client@test.com',
      password: hashedPassword,
      role: 'client'
    });

    await client.save();
    console.log('✅ COMPTE CLIENT créé:');
    console.log('  Email: client@test.com');
    console.log('  Mot de passe: tattoo123');
    console.log('  Rôle: client');
    console.log('');

    console.log('🎯 RÉSUMÉ DES IDENTIFIANTS:');
    console.log('============================');
    console.log('ILONA (Tatoueur):');
    console.log('  Email: ilona.faynn@gmail.com');
    console.log('  Mot de passe: tattoo123');
    console.log('');
    console.log('CLÉMENT (Tatoueur):');
    console.log('  Email: clemvanker@gmail.com');
    console.log('  Mot de passe: tattoo123');
    console.log('');
    console.log('CLIENT TEST:');
    console.log('  Email: client@test.com');
    console.log('  Mot de passe: tattoo123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
createAccounts();
