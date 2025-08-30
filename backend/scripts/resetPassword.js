const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function resetPassword() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');

    // Réinitialiser le mot de passe d'Ilona
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const result = await User.updateOne(
      { email: 'ilona.faynn@gmail.com' },
      { password: hashedPassword }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Mot de passe d\'Ilona réinitialisé à: password123');
    } else {
      console.log('❌ Utilisateur Ilona non trouvé');
    }

    // Réinitialiser aussi le mot de passe de Clément
    const result2 = await User.updateOne(
      { email: 'clemvanker@gmail.com' },
      { password: hashedPassword }
    );

    if (result2.modifiedCount > 0) {
      console.log('✅ Mot de passe de Clément réinitialisé à: password123');
    } else {
      console.log('❌ Utilisateur Clément non trouvé');
    }

    console.log('\n🔑 Utilisez ces identifiants pour vous connecter:');
    console.log('Cliente: ilona.faynn@gmail.com / password123');
    console.log('Tatoueur: clemvanker@gmail.com / password123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    console.log('🔌 Déconnexion MongoDB');
    await mongoose.disconnect();
  }
}

resetPassword();
