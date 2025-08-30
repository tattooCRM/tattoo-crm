const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema({
  // Référence à l'utilisateur (peut être null si le client n'a pas de compte)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Permet les valeurs null
  },
  
  // Référence du tatoueur qui gère ce client
  tattooArtistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations personnelles
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  dateNaissance: {
    type: Date
  },
  
  // Adresse
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'France'
    }
  },
  
  // Profil tatouage
  experienceTatouage: {
    type: String,
    enum: ['first_time', 'some_experience', 'experienced', 'heavily_tattooed'],
    default: 'first_time'
  },
  
  // Préférences
  preferences: {
    styles: [{
      type: String,
      enum: ['realistic', 'traditional', 'geometric', 'minimalist', 'blackwork', 'watercolor', 'tribal', 'japanese', 'other']
    }],
    zones: [{
      type: String,
      enum: ['arm', 'leg', 'back', 'chest', 'shoulder', 'wrist', 'ankle', 'neck', 'other']
    }],
    tailles: [{
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge']
    }],
    budgetRange: {
      min: Number,
      max: Number
    },
    disponibilites: [{
      type: String,
      enum: ['weekdays', 'weekends', 'evenings', 'flexible']
    }]
  },
  
  // Historique médical (important pour tatouage)
  medical: {
    allergies: [String],
    medicaments: [String],
    conditionsMedicales: [String],
    grossesse: {
      type: Boolean,
      default: false
    },
    allaitement: {
      type: Boolean,
      default: false
    },
    donSangRecent: {
      type: Boolean,
      default: false
    }
  },
  
  // Historique avec le tatoueur
  statistiques: {
    nombreProjets: {
      type: Number,
      default: 0
    },
    nombreTatouages: {
      type: Number,
      default: 0
    },
    montantTotal: {
      type: Number,
      default: 0
    },
    premierContact: {
      type: Date,
      default: Date.now
    },
    dernierContact: Date
  },
  
  // Relations avec les projets
  projets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
  // Relations avec les devis
  devis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }],
  
  // Notes du tatoueur
  notes: {
    publiques: String, // Visibles par le client
    privees: String    // Seulement pour le tatoueur
  },
  
  // Tags pour organisation
  tags: [String],
  
  // Statut du client
  statut: {
    type: String,
    enum: ['prospect', 'client', 'regulier', 'inactif'],
    default: 'prospect'
  },
  
  // Préférences de communication
  communication: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    appel: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  
  // Source d'acquisition
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'walk_in', 'advertisement', 'other'],
    default: 'other'
  },
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherche et performance
clientProfileSchema.index({ tattooArtistId: 1 });
clientProfileSchema.index({ email: 1, tattooArtistId: 1 });
clientProfileSchema.index({ nom: 1, prenom: 1 });
clientProfileSchema.index({ statut: 1 });
clientProfileSchema.index({ createdAt: -1 });
clientProfileSchema.index({ lastActivityAt: -1 });

// Middleware pour mettre à jour updatedAt
clientProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour calculer l'âge
clientProfileSchema.methods.getAge = function() {
  if (!this.dateNaissance) return null;
  const today = new Date();
  const birthDate = new Date(this.dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Méthode pour obtenir le nom complet
clientProfileSchema.methods.getFullName = function() {
  return `${this.prenom} ${this.nom}`;
};

// Méthode statique pour créer un profil client automatiquement
clientProfileSchema.statics.createFromUser = async function(userId, tattooArtistId) {
  const User = require('./User');
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // Vérifier si le profil existe déjà
  const existingProfile = await this.findOne({ 
    userId: userId, 
    tattooArtistId: tattooArtistId 
  });
  
  if (existingProfile) {
    return existingProfile;
  }
  
  // Créer le nouveau profil client
  const clientProfile = new this({
    userId: user._id,
    tattooArtistId: tattooArtistId,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    phone: user.phone,
    statut: 'prospect',
    source: 'website'
  });
  
  await clientProfile.save();
  return clientProfile;
};

module.exports = mongoose.model('ClientProfile', clientProfileSchema);
