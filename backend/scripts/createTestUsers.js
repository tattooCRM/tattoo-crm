require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Vérifier si les utilisateurs existent déjà
    const existingArtist = await User.findOne({ email: 'test@tatoueur.com' });
    const existingClient = await User.findOne({ email: 'john@example.com' });

    // Créer l'artiste tatoueur si nécessaire
    if (!existingArtist) {
      const hashedPassword = await bcrypt.hash('password', 10);
      const artist = new User({
        email: 'test@tatoueur.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Tatoueur',
        role: 'tattoo_artist',
        isVerified: true
      });
      await artist.save();
      console.log('✅ Utilisateur tatoueur créé');
    } else {
      console.log('✅ Utilisateur tatoueur existant trouvé');
    }

    // Créer le client si nécessaire
    if (!existingClient) {
      const hashedPassword = await bcrypt.hash('password', 10);
      const client = new User({
        email: 'john@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'client',
        isVerified: true
      });
      await client.save();
      console.log('✅ Utilisateur client créé');
    } else {
      console.log('✅ Utilisateur client existant trouvé');
    }

    console.log('\n🎉 Utilisateurs de test prêts !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUsers();
