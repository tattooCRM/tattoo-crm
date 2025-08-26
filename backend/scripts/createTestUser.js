const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');

    // Supprimer l'utilisateur test s'il existe déjà
    await User.deleteOne({ email: 'test@example.com' });
    await User.deleteOne({ email: 'tattoo@example.com' });

    // Créer un client test
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const testClient = new User({
      email: 'test@example.com',
      password: hashedPassword,
      role: 'client',
      name: 'Test Client',
      prenom: 'Test',
      nom: 'Client',
      isActive: true
    });

    await testClient.save();
    console.log('✅ Client test créé:', testClient.email, testClient._id);

    // Créer un tatoueur test
    const testTattooArtist = new User({
      email: 'tattoo@example.com',
      password: hashedPassword,
      role: 'tattoo_artist',
      prenom: 'Marie',
      nom: 'Test',
      name: 'Marie Test',
      slug: 'marie-test-artist',
      specialty: 'Géométrique et minimaliste',
      bio: 'Tatoueur test spécialisé dans les designs géométriques et minimalistes',
      isActive: true,
      isPublicPageActive: true
    });

    await testTattooArtist.save();
    console.log('✅ Tatoueur test créé:', testTattooArtist.email, testTattooArtist._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();
