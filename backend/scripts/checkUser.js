require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    const user = await User.findOne({ email: 'test@tatoueur.com' });
    if (user) {
      console.log('✅ Utilisateur trouvé:', {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        hasPassword: !!user.password
      });

      // Tester le mot de passe
      const isValidPassword = await bcrypt.compare('password', user.password);
      console.log('🔑 Test mot de passe:', isValidPassword ? '✅ Valide' : '❌ Invalide');
      
      // Afficher le hash stocké (premiers caractères seulement)
      console.log('🔐 Hash stocké:', user.password?.substring(0, 20) + '...');
      
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
