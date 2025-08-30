const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

async function createTestClient() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connexion MongoDB réussie');

        // Vérifier si le client existe déjà
        const existingClient = await User.findOne({ email: 'client@test.com' });
        
        if (existingClient) {
            console.log('👤 Client de test existe déjà:', {
                id: existingClient._id,
                name: existingClient.name,
                email: existingClient.email,
                role: existingClient.role
            });
            return;
        }

        // Créer un nouveau client de test
        const testClient = new User({
            name: 'Test Client',
            email: 'client@test.com',
            password: 'hashedpassword123', // En production, utiliser bcrypt
            role: 'client'
        });

        await testClient.save();
        console.log('✅ Client de test créé:', {
            id: testClient._id,
            name: testClient.name,
            email: testClient.email,
            role: testClient.role
        });

        // Afficher tous les utilisateurs pour vérification
        const allUsers = await User.find({}, 'name email role slug');
        console.log('\n📋 Tous les utilisateurs:');
        allUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - role: ${user.role}, slug: ${user.slug || 'N/A'}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnexion MongoDB');
    }
}

createTestClient();
