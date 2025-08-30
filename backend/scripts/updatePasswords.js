require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Mettre à jour le mot de passe du tatoueur
    const hashedPassword = await bcrypt.hash('tattoo123', 10);
    
    await User.updateOne(
      { email: 'test@tatoueur.com' },
      { $set: { password: hashedPassword } }
    );
    console.log('✅ Mot de passe tatoueur mis à jour: tattoo123');

    // Mettre à jour le mot de passe du client
    await User.updateOne(
      { email: 'john@example.com' },
      { $set: { password: hashedPassword } }
    );
    console.log('✅ Mot de passe client mis à jour: tattoo123');

    // Vérification
    const artist = await User.findOne({ email: 'test@tatoueur.com' });
    const client = await User.findOne({ email: 'john@example.com' });
    
    const artistPasswordValid = await bcrypt.compare('tattoo123', artist.password);
    const clientPasswordValid = await bcrypt.compare('tattoo123', client.password);
    
    console.log('🔑 Vérification mot de passe tatoueur:', artistPasswordValid ? '✅ Valide' : '❌ Invalide');
    console.log('🔑 Vérification mot de passe client:', clientPasswordValid ? '✅ Valide' : '❌ Invalide');

    console.log('\n📋 Identifiants finaux:');
    console.log('🎨 Tatoueur: test@tatoueur.com / tattoo123');
    console.log('👤 Client: john@example.com / tattoo123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updatePasswords();
