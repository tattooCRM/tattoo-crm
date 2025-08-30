require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function updateUserPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Mettre à jour l'utilisateur tatoueur
    const hashedPassword = await bcrypt.hash('password', 10);
    
    await User.updateOne(
      { email: 'test@tatoueur.com' },
      {
        $set: {
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Tatoueur',
          isVerified: true
        }
      }
    );

    await User.updateOne(
      { email: 'john@example.com' },
      {
        $set: {
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true
        }
      }
    );

    console.log('✅ Utilisateurs mis à jour');

    // Vérification
    const user = await User.findOne({ email: 'test@tatoueur.com' });
    const isValidPassword = await bcrypt.compare('password', user.password);
    console.log('🔑 Vérification mot de passe:', isValidPassword ? '✅ Valide' : '❌ Invalide');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUserPassword();
