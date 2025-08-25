const mongoose = require('mongoose');
const User = require('../models/User');

// Script pour mettre à jour les données d'Ilona (sushit)
async function updateIlona() {
  try {
    await mongoose.connect('mongodb+srv://t3mq:root@bennys.rkieo.mongodb.net/');
    console.log('✅ Connexion à MongoDB réussie');

    // Chercher Ilona par slug ou nom
    let ilona = await User.findOne({ 
      $or: [
        { slug: 'sushit' },
        { name: /ilona/i },
        { email: /ilona/i }
      ]
    });

    if (!ilona) {
      console.log('❌ Utilisateur Ilona non trouvé');
      
      // Lister tous les tatoueurs
      const tattooists = await User.find({ role: 'tattoo_artist' });
      console.log('📋 Tatoueurs existants:');
      tattooists.forEach(t => {
        console.log(`- ${t.name} (${t.email}) | Slug: ${t.slug || 'N/A'}`);
      });
      
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${ilona.name} (${ilona.email})`);

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
    console.log('✅ Utilisateur mis à jour avec succès');
    
    // Vérifier les mises à jour
    const updatedUser = await User.findById(ilona._id);
    console.log('📊 Données mises à jour:');
    console.log(`- Nom: ${updatedUser.name}`);
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Slug: ${updatedUser.slug}`);
    console.log(`- Rôle: ${updatedUser.role}`);
    console.log(`- Page publique active: ${updatedUser.isPublicPageActive}`);
    console.log(`- Spécialité: ${updatedUser.specialty}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Déconnexion de MongoDB');
  }
}

updateIlona();
