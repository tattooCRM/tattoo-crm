const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Référence du projet
  projectNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Participants
  tattooArtistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Lien avec le devis accepté
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true
  },
  
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  
  // Informations du projet
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Détails du tatouage
  style: {
    type: String,
    enum: ['realistic', 'traditional', 'geometric', 'minimalist', 'blackwork', 'watercolor', 'tribal', 'japanese', 'other'],
    required: true
  },
  bodyZone: {
    type: String,
    enum: ['arm', 'leg', 'back', 'chest', 'shoulder', 'wrist', 'ankle', 'neck', 'other'],
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'xlarge'],
    required: true
  },
  
  // Images
  referenceImages: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  designImages: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  finalImages: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Planification
  estimatedDuration: {
    type: Number, // en heures
    required: true
  },
  sessionCount: {
    type: Number,
    default: 1,
    min: 1
  },
  sessions: [{
    sessionNumber: { type: Number, required: true },
    scheduledDate: Date,
    startTime: String,
    endTime: String,
    duration: Number, // en heures
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String,
    completedAt: Date
  }],
  
  // Statut et suivi
  status: {
    type: String,
    enum: ['pending', 'design_phase', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Informations financières
  totalAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'deposit_paid', 'partially_paid', 'fully_paid'],
    default: 'pending'
  },
  
  // Préférences et notes
  clientNotes: String,
  artistNotes: String,
  isIntimate: {
    type: Boolean,
    default: false
  },
  
  // Suivi des modifications
  revisions: [{
    date: { type: Date, default: Date.now },
    description: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Dates importantes
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date
});

// Index pour recherche
projectSchema.index({ projectNumber: 1 });
projectSchema.index({ tattooArtistId: 1 });
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

// Middleware pour mettre à jour updatedAt
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour générer un numéro de projet unique
projectSchema.statics.generateProjectNumber = async function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  let counter = 1;
  let projectNumber;
  
  do {
    projectNumber = `PRJ-${year}${month}${day}-${String(counter).padStart(4, '0')}`;
    const existing = await this.findOne({ projectNumber });
    if (!existing) break;
    counter++;
  } while (counter < 10000);
  
  return projectNumber;
};

module.exports = mongoose.model('Project', projectSchema);
