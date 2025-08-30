const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prenom: { type: String }, // Prénom de l'utilisateur
    nom: { type: String }, // Nom de famille de l'utilisateur
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['client', 'tattoo_artist', 'admin', 'user'],
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

// Middleware pour convertir 'user' en 'client' automatiquement
userSchema.pre('save', function(next) {
    if (this.role === 'user') {
        this.role = 'client';
    }
    next();
});

module.exports = mongoose.model('User', userSchema);