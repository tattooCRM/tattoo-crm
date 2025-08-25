const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['client', 'tattoo_artist', 'admin'],
        default: 'client'
    },
    // Champs spécifiques aux tatoueurs
    specialty: { type: String }, // Ex: "Traditionnel, Réalisme"
    profilePhoto: { type: String }, // URL de la photo de profil
    bio: { type: String }, // Description du tatoueur
    instagram: { type: String }, // Handle Instagram
    portfolio: [{ type: String }], // URLs des images du portfolio
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    
    // Informations de contact
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    
    // Page publique
    slug: { type: String, unique: true, sparse: true }, // URL personnalisée
    isPublicPageActive: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);