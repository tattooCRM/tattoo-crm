const mongoose = require('mongoose');

const PublicPageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        unique: true 
    },
    username: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    slug: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    description: { 
        type: String,
        trim: true,
        maxlength: 500
    },
    theme: { 
        type: String, 
        required: true,
        enum: ['dark', 'minimal', 'vintage', 'neon', 'elegant'],
        default: 'dark'
    },
    headerImage: {
        type: String,
        trim: true
    },
    instagram: { 
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    openingHours: {
        type: String,
        trim: true
    },
    pricing: {
        type: String,
        trim: true
    },
    profilePhoto: { 
        type: String // URL de l'image uploadée
    },
    gallery: [{ 
        type: String // URLs des images de la galerie
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    },
    views: { 
        type: Number, 
        default: 0 
    },
    settings: {
        allowBooking: { type: Boolean, default: true },
        showContact: { type: Boolean, default: true },
        customCSS: { type: String, default: '' }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour optimiser les recherches - supprimé car déjà défini avec unique: true
// PublicPageSchema.index({ slug: 1 });
// PublicPageSchema.index({ userId: 1 });
PublicPageSchema.index({ isActive: 1 });

// Virtual pour l'URL complète
PublicPageSchema.virtual('fullUrl').get(function() {
    return `/artist/${this.slug}`;
});

// Middleware pour générer le slug automatiquement si pas fourni
PublicPageSchema.pre('save', function(next) {
    if (this.username && !this.slug) {
        this.slug = this.username
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

module.exports = mongoose.model('PublicPage', PublicPageSchema);