const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const createTestArtists = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Créer quelques tatoueurs de test
    const testArtists = [
      {
        name: 'Alice Martin',
        slug: 'alice-martin',
        email: 'alice@tattoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'tattoo_artist',
        specialty: 'Réalisme, Portraits',
        bio: 'Spécialisée dans les portraits réalistes depuis 10 ans.',
        instagram: '@alice_tattoo',
        isPublicPageActive: true
      },
      {
        name: 'Bob Smith',
        slug: 'bob-smith',
        email: 'bob@tattoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'tattoo_artist',
        specialty: 'Traditionnel, Old School',
        bio: 'Expert en tatouage traditionnel américain.',
        instagram: '@bob_oldschool',
        isPublicPageActive: true
      },
      {
        name: 'Claire Dubois',
        slug: 'claire-dubois',
        email: 'claire@tattoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'tattoo_artist',
        specialty: 'Minimaliste, Géométrique',
        bio: 'Créatrice de designs minimalistes et géométriques.',
        instagram: '@claire_minimal',
        isPublicPageActive: true
      }
    ];

    for (const artistData of testArtists) {
      const existingArtist = await User.findOne({ email: artistData.email });
      if (!existingArtist) {
        const artist = new User(artistData);
        await artist.save();
      } else {
      }
    }

    const allArtists = await User.find({ role: 'tattoo_artist' }, 'name slug email specialty');
    allArtists.forEach(artist => {
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
    mongoose.disconnect();
  }
};

createTestArtists();
