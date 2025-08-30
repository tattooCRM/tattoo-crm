const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['client', 'tattoo_artist'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  projectType: {
    type: String,
    enum: ['first', 'addition', 'coverup', 'touchup', 'geometrique', 'minimaliste', 'traditionnel', 'realisme', 'japonais', 'tribal', 'autre'],
    default: 'autre'
  },
  clientNotes: String, // Notes du tatoueur sur le client
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'project', 'system', 'quote'],
    default: 'text'
  },
  fileUrl: String, // Pour les images/fichiers
  fileName: String,
  fileSize: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }, // Pour stocker des données supplémentaires (ex: info devis)
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les performances
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ lastActivity: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

module.exports = {
  Conversation: mongoose.model('Conversation', conversationSchema),
  Message: mongoose.model('Message', messageSchema)
};
