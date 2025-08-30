const mongoose = require('mongoose');
const User = require('../models/User');

// Script pour mettre à jour les données d'Ilona (sushit)
async function updateIlona() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');

    // Chercher Ilona par slug ou nom
    let ilona = await User.findOne({ 
      $or: [
        { slug: 'sushit' },
        { name: /ilona/i },
        { email: /ilona/i }
      ]
    });

    if (!ilona) {
      
      // Lister tous les tatoueurs
      const tattooists = await User.find({ role: 'tattoo_artist' });
      tattooists.forEach(t => {
      });
      
      return;
    }


    // Mettre à jour les données
    const updates = {
      slug: 'sushit',
      isPublicPageActive: true,
      role: 'tattoo_artist',
      specialty: 'Sushi Art, Kawaii, Japonais, Minimaliste',
      bio: 'Artiste tatoueur spécialisée dans l\'art japonais et les designs kawaii. Passionnée par les motifs délicats et colorés.',
      instagram: 'sushit_tattoo'
    };

    await User.findByIdAndUpdate(ilona._id, updates);
    
    // Vérifier les mises à jour
    const updatedUser = await User.findById(ilona._id);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateIlona();
