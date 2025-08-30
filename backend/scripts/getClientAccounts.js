const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Script pour lister tous les comptes clients
async function getClientAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔍 Recherche des comptes clients...\n');

    // Chercher tous les clients
    const clients = await User.find({ role: 'client' });

    if (clients.length > 0) {
      console.log('👥 COMPTES CLIENTS DISPONIBLES:');
      console.log('===============================\n');
      
      clients.forEach((client, index) => {
        console.log(`${index + 1}. ${client.name || 'Sans nom'}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Rôle: ${client.role}`);
        console.log(`   ID: ${client._id}`);
        console.log('   Mot de passe: tattoo123 (si créé récemment)');
        console.log('');
      });

      console.log('🎯 IDENTIFIANTS DE CONNEXION CLIENT:');
      console.log('===================================');
      console.log(`Email: ${clients[0].email}`);
      console.log('Mot de passe: tattoo123');
      
    } else {
      console.log('❌ Aucun compte client trouvé');
      
      // Créer un compte client de test
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('tattoo123', 10);
      
      const newClient = new User({
        name: 'Marie Dupont',
        email: 'marie.client@test.com',
        password: hashedPassword,
        role: 'client'
      });

      await newClient.save();
      
      console.log('✅ NOUVEAU COMPTE CLIENT créé:');
      console.log('  Email: marie.client@test.com');
      console.log('  Mot de passe: tattoo123');
      console.log('  Rôle: client');
    }

    // Lister tous les utilisateurs pour référence
    console.log('\n📋 RÉSUMÉ DE TOUS LES COMPTES:');
    console.log('=============================');
    const allUsers = await User.find({});
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
getClientAccounts();
