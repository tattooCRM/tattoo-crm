require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function fixUserPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Générer le hash pour 'tattoo123'
    const hashedPassword = await bcrypt.hash('tattoo123', 10);
    console.log('🔐 Hash généré pour tattoo123');

    // Mettre à jour tous les utilisateurs test
    const updateResult1 = await User.updateOne(
      { email: 'test@tatoueur.com' },
      { 
        $set: { 
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Tatoueur',
          nom: 'Tatoueur',
          prenom: 'Test',
          isVerified: true 
        } 
      },
      { upsert: false }
    );

    const updateResult2 = await User.updateOne(
      { email: 'john@example.com' },
      { 
        $set: { 
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          nom: 'Doe',
          prenom: 'John',
          isVerified: true 
        } 
      },
      { upsert: false }
    );

    console.log('👨‍🎨 Tatoueur mis à jour:', updateResult1.matchedCount > 0 ? '✅' : '❌');
    console.log('👤 Client mis à jour:', updateResult2.matchedCount > 0 ? '✅' : '❌');

    // Vérifier les utilisateurs mis à jour
    const users = await User.find({ 
      email: { $in: ['test@tatoueur.com', 'john@example.com'] } 
    }, 'email nom prenom role');
    
    console.log('\n📋 Utilisateurs configurés:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.prenom} ${user.nom} (${user.role})`);
    });

    console.log('\n🔑 Mots de passe mis à jour: tattoo123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixUserPasswords();
