const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);

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

    console.log('✅ Utilisateurs test créés');
    
    // Générer un token JWT pour le client
    const token = jwt.sign(
      { 
        id: testClient._id, 
        email: testClient.email, 
        role: testClient.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('\n🔑 Token JWT pour les tests API:');
    console.log(token);
    
    console.log('\n📝 Commande curl pour tester l\'API messages:');
    console.log(`curl -X GET "http://localhost:5000/api/chat/conversations/68ae0861745ae092658290de/messages" \\`);
    console.log(`-H "Content-Type: application/json" \\`);
    console.log(`-H "Authorization: Bearer ${token}"`);
    
    console.log('\n👤 Informations utilisateur:');
    console.log({
      id: testClient._id,
      email: testClient.email,
      role: testClient.role,
      name: testClient.name
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();
