require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createTempUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');

    // Supprimer les utilisateurs temporaires s'ils existent
    await User.deleteMany({ email: { $in: ['temp-client@test.com', 'temp-tattoo@test.com'] } });

    // Client temporaire
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const tempClient = new User({
      name: 'Client Temp',
      email: 'temp-client@test.com',
      password: hashedPassword,
      role: 'client',
      phone: '0123456789'
    });

    const tempTattooArtist = new User({
      name: 'Tattoo Artist Temp',
      slug: 'temp-tattoo-artist',
      email: 'temp-tattoo@test.com',
      password: hashedPassword,
      role: 'tattoo_artist',
      specialty: 'Réaliste',
      bio: 'Artiste tatoueur spécialisé dans le réalisme',
      instagram: '@temp_tattoo',
      phone: '0987654321'
    });

    await tempClient.save();
    await tempTattooArtist.save();

    console.log('✅ Utilisateurs temporaires créés:', tempClient.email, tempTattooArtist.email);
    console.log('Client ID:', tempClient._id);
    console.log('Tattoo Artist ID:', tempTattooArtist._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

createTempUsers();
