const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

async function fixUserRole() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connexion MongoDB réussie');

        // Trouver l'utilisateur spécifique par ID
        const userId = '68b065388162cb5c070cd505';
        const user = await User.findById(userId);
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé avec cet ID');
            return;
        }

        console.log('👤 Utilisateur trouvé:', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            slug: user.slug
        });

        // Mise à jour du rôle si nécessaire
        if (user.role !== 'tattoo_artist') {
            user.role = 'tattoo_artist';
            console.log('🔄 Mise à jour du rôle vers tattoo_artist');
        }

        // Ajouter/corriger le slug si manquant
        if (!user.slug) {
            user.slug = 'test';
            console.log('🔄 Ajout du slug: test');
        }

        // Sauvegarder les modifications
        await user.save();
        console.log('✅ Utilisateur mis à jour avec succès');

        // Vérifier tous les tatoueurs
        const tattooArtists = await User.find({ role: 'tattoo_artist' }, 'name email slug');
        console.log('\n📋 Tous les tatoueurs:');
        tattooArtists.forEach(artist => {
            console.log(`- ${artist.name} (${artist.email}) - slug: ${artist.slug || 'N/A'}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnexion MongoDB');
    }
}

fixUserRole();
