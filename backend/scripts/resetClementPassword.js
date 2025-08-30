const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function resetClementPassword() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');
    
    // Trouver Clément
    const clement = await User.findOne({ email: 'clemvanker@gmail.com' });
    if (!clement) {
      console.log('❌ Clément non trouvé');
      return;
    }
    
    console.log('👤 Utilisateur trouvé:', clement.name, clement.email);
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash('root', 10);
    
    // Mettre à jour le mot de passe
    await User.findByIdAndUpdate(clement._id, { password: hashedPassword });
    
    console.log('✅ Mot de passe mis à jour pour Clément');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetClementPassword();
