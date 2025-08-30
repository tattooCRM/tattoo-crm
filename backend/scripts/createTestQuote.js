const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Quote = require('../models/Quote');
const User = require('../models/User');

async function createTestQuote() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connexion MongoDB Atlas réussie');

        // Trouver un tatoueur et un client
        const tattooArtist = await User.findOne({ role: 'tattoo_artist' });
        const client = await User.findOne({ role: 'client' });

        if (!tattooArtist) {
            console.log('❌ Aucun tatoueur trouvé');
            return;
        }

        if (!client) {
            console.log('❌ Aucun client trouvé');
            return;
        }

        // Créer un devis de test
        const subtotal = 800;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const testQuote = new Quote({
            quoteNumber: `DEV-${year}${month}-001`, // Manuel pour le test
            tattooArtistId: tattooArtist._id,
            clientId: client._id,
            conversationId: new mongoose.Types.ObjectId(), // ID bidon pour le test
            title: 'Devis Tatouage Dragon Japonais',
            clientInfo: {
                name: client.name,
                email: client.email,
                phone: '+33 6 12 34 56 78',
                address: {
                    street: '123 Rue de la Paix',
                    city: 'Paris',
                    zipCode: '75001',
                    country: 'France'
                }
            },
            artistInfo: {
                name: tattooArtist.name,
                email: tattooArtist.email,
                phone: '+33 6 98 76 54 32',
                address: {
                    street: '456 Avenue du Tatouage',
                    city: 'Paris',
                    zipCode: '75002',
                    country: 'France'
                },
                siret: '12345678901234',
                tva: 'FR12345678901'
            },
            items: [
                {
                    description: 'Conception et dessin personnalisé',
                    quantity: 1,
                    unitPrice: 150,
                    totalPrice: 150
                },
                {
                    description: 'Séance de tatouage (4 heures)',
                    quantity: 1,
                    unitPrice: 600,
                    totalPrice: 600
                },
                {
                    description: 'Produits de soin post-tatouage',
                    quantity: 1,
                    unitPrice: 50,
                    totalPrice: 50
                }
            ],
            subtotal: subtotal,
            taxRate: 0, // Pas de TVA pour cet exemple
            taxAmount: 0,
            totalAmount: subtotal,
            status: 'sent',
            notes: 'Le client devra éviter l\'exposition au soleil pendant 2 semaines après la séance.',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            sentAt: new Date()
        });

        await testQuote.save();
        console.log('✅ Devis de test créé:', {
            id: testQuote._id,
            number: testQuote.quoteNumber,
            title: testQuote.title,
            client: testQuote.clientInfo.name,
            artist: testQuote.artistInfo.name,
            totalAmount: testQuote.totalAmount + '€',
            status: testQuote.status
        });

        console.log('\n🔗 URL de test PDF:');
        console.log(`http://localhost:5000/api/quotes/${testQuote._id}/pdf`);
        console.log(`http://localhost:5000/api/quotes/${testQuote._id}/view`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnexion MongoDB');
    }
}

createTestQuote();
