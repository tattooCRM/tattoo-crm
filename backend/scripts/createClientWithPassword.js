const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../models/User');

async function createClientWithRealPassword() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connexion MongoDB réussie');

        // Supprimer l'ancien client de test s'il existe
        await User.deleteOne({ email: 'client@test.com' });

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Créer un nouveau client de test
        const testClient = new User({
            name: 'Test Client',
            email: 'client@test.com',
            password: hashedPassword,
            role: 'client'
        });

        await testClient.save();
        console.log('✅ Client de test créé avec mot de passe hashé:', {
            id: testClient._id,
            name: testClient.name,
            email: testClient.email,
            role: testClient.role,
            password: 'password123'
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnexion MongoDB');
    }
}

createClientWithRealPassword();
