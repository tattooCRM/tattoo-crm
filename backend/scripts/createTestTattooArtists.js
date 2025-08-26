const mongoose = require('mongoose');
const User = require('../models/User');
const PublicPage = require('../models/PublicPage');
require('dotenv').config();

async function createTestTattooArtists() {
  try {
    // Se connecter à MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/tattoo-crm';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB');
    console.log('🔗 URI utilisée:', mongoURI.replace(/:[^:]+@/, ':***@')); // Masquer le mot de passe

    // Créer des tatoueurs de test s'ils n'existent pas
    const testArtists = [
      {
        userData: {
          name: 'Alex Martinez',
          email: 'alex@tattoo.com',
          password: '$2a$10$example', // Mot de passe hashé
          role: 'tattoo_artist',
          specialty: 'Traditionnel, Réalisme',
          bio: 'Artiste tatoueur passionné avec 10 ans d\'expérience',
          slug: 'alex-martinez',
          isPublicPageActive: true,
          instagram: '@alex_tattoo',
          phone: '+33 6 12 34 56 78'
        },
        pageData: {
          username: 'alex-martinez',
          title: 'Alex Martinez - Tatoueur Traditionnel',
          description: 'Spécialiste du tatouage traditionnel et réaliste avec plus de 10 ans d\'expérience. Basé à Paris, je crée des œuvres uniques qui racontent votre histoire.',
          theme: 'dark',
          instagram: 'alex_tattoo',
          phone: '+33 6 12 34 56 78',
          email: 'alex@tattoo.com',
          slug: 'alex-martinez'
        }
      },
      {
        userData: {
          name: 'Marie Dubois',
          email: 'marie@tattoo.com',
          password: '$2a$10$example',
          role: 'tattoo_artist',
          specialty: 'Géométrique, Minimaliste',
          bio: 'Spécialiste des tatouages géométriques et minimalistes',
          slug: 'marie-dubois',
          isPublicPageActive: true,
          instagram: '@marie_geometric',
          phone: '+33 6 98 76 54 32'
        },
        pageData: {
          username: 'marie-dubois',
          title: 'Marie Dubois - Géométrie & Minimalisme',
          description: 'Créatrice de tatouages géométriques et minimalistes. Chaque design est pensé pour s\'harmoniser parfaitement avec votre corps et votre personnalité.',
          theme: 'minimal',
          instagram: 'marie_geometric',
          phone: '+33 6 98 76 54 32',
          email: 'marie@tattoo.com',
          slug: 'marie-dubois'
        }
      }
    ];

    for (const { userData, pageData } of testArtists) {
      let artist = await User.findOne({ email: userData.email });
      
      if (!artist) {
        artist = new User(userData);
        await artist.save();
        console.log(`✅ Tatoueur créé: ${artist.name} (${artist.email})`);
      } else {
        // Mettre à jour les propriétés manquantes
        Object.assign(artist, userData);
        await artist.save();
        console.log(`🔄 Tatoueur mis à jour: ${artist.name} (${artist.email})`);
      }

      // Créer ou mettre à jour la page publique
      let publicPage = await PublicPage.findOne({ userId: artist._id });
      
      if (!publicPage) {
        publicPage = new PublicPage({
          ...pageData,
          userId: artist._id,
          isActive: true
        });
        await publicPage.save();
        console.log(`✅ Page publique créée pour: ${artist.name}`);
      } else {
        Object.assign(publicPage, pageData);
        publicPage.isActive = true;
        await publicPage.save();
        console.log(`🔄 Page publique mise à jour pour: ${artist.name}`);
      }
    }

    // Vérifier tous les tatoueurs existants
    const allArtists = await User.find({ role: 'tattoo_artist' });
    const allPages = await PublicPage.find({ isActive: true }).populate('userId', 'name email');
    
    console.log(`\n📊 Statistiques des tatoueurs:`);
    console.log(`Total: ${allArtists.length}`);
    console.log(`Avec page publique active: ${allArtists.filter(a => a.isPublicPageActive).length}`);
    console.log(`Avec slug: ${allArtists.filter(a => a.slug).length}`);
    console.log(`Pages publiques actives: ${allPages.length}`);
    
    console.log(`\n🎨 Liste des tatoueurs disponibles:`);
    allArtists.forEach(artist => {
      const hasPublicPage = allPages.find(p => p.userId._id.toString() === artist._id.toString());
      console.log(`- ${artist.name} (${artist.email})`);
      console.log(`  ID: ${artist._id}`);
      console.log(`  Slug: ${artist.slug || 'Aucun'}`);
      console.log(`  Page publique: ${artist.isPublicPageActive ? '✅' : '❌'}`);
      console.log(`  Page publique activé: ${hasPublicPage ? '✅' : '❌'}`);
      console.log(`  Spécialité: ${artist.specialty || 'Non définie'}`);
      console.log('');
    });

    console.log(`\n🌐 Pages publiques actives:`);
    allPages.forEach(page => {
      console.log(`- ${page.title} (/${page.slug})`);
      console.log(`  Utilisateur: ${page.userId.name} (${page.userId.email})`);
      console.log(`  Thème: ${page.theme}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestTattooArtists().catch(console.error);
}

module.exports = createTestTattooArtists;
