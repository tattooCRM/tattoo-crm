const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

// Script pour réinitialiser les mots de passe de tous les comptes
async function resetAllPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-crm');

    console.log('🔧 Réinitialisation des mots de passe...\n');

    const newPassword = 'tattoo123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour tous les utilisateurs avec le nouveau mot de passe
    const result = await User.updateMany({}, { password: hashedPassword });
    
    console.log(`✅ ${result.modifiedCount} comptes mis à jour`);
    
    // Lister tous les comptes
    const allUsers = await User.find({});
    console.log('\n📋 TOUS LES COMPTES AVEC MOT DE PASSE RÉINITIALISÉ:');
    console.log('===============================================');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      console.log(`  Mot de passe: tattoo123`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le script
resetAllPasswords();
