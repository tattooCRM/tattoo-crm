const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const quoteSchema = new mongoose.Schema({
  // Référence du devis
  quoteNumber: {
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
  
  // Lien avec la conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Informations du devis
  title: {
    type: String,
    default: 'Devis Tatouage'
  },
  
  // Informations client (copie pour archivage)
  clientInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: { type: String, default: 'France' }
    }
  },
  
  // Informations tatoueur (copie pour archivage)
  artistInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: { type: String, default: 'France' }
    },
    siret: String,
    tva: String
  },
  
  // Éléments du devis
  items: [quoteItemSchema],
  
  // Totaux
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Conditions et notes
  notes: String,
  terms: {
    type: String,
    default: 'Ce devis est valable 30 jours à compter de sa date d\'émission. Un acompte de 30% sera demandé à la validation du devis.'
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'declined', 'expired'],
    default: 'draft'
  },
  
  // Dates importantes
  sentAt: Date,
  respondedAt: Date,
  
  // Personnalisation
  styling: {
    primaryColor: { type: String, default: '#3182ce' },
    secondaryColor: { type: String, default: '#2d3748' },
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    logo: String, // URL ou base64
    headerText: String,
    footerText: String
  },
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Générer automatiquement le numéro de devis
quoteSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Trouver le prochain numéro séquentiel pour ce tatoueur cette année
    const count = await this.constructor.countDocuments({
      tattooArtistId: this.tattooArtistId,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    
    const sequentialNumber = String(count + 1).padStart(3, '0');
    this.quoteNumber = `DEV-${year}${month}-${sequentialNumber}`;
  }
  
  this.updatedAt = new Date();
  next();
});

// Index pour optimiser les performances
quoteSchema.index({ tattooArtistId: 1, createdAt: -1 });
quoteSchema.index({ clientId: 1, createdAt: -1 });
quoteSchema.index({ conversationId: 1 });
quoteSchema.index({ status: 1 });
// Note: quoteNumber a déjà un index unique via la propriété unique: true

module.exports = mongoose.model('Quote', quoteSchema);
