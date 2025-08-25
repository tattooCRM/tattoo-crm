const { Conversation, Message } = require('../models/Chat');
const User = require('../models/User');

// Créer un message projet formaté
const createProjectMessage = (projectData) => {
  const projectTypes = {
    'first': 'Premier tatouage',
    'addition': 'Ajout à une collection',
    'coverup': 'Cover-up',
    'touchup': 'Retouche'
  };

  const bodyZones = {
    'arm': 'Bras',
    'leg': 'Jambe', 
    'back': 'Dos',
    'chest': 'Poitrine',
    'shoulder': 'Épaule',
    'wrist': 'Poignet',
    'ankle': 'Cheville',
    'other': 'Autre'
  };

  const styles = {
    'realistic': 'Réaliste',
    'traditional': 'Traditionnel',
    'geometric': 'Géométrique',
    'minimalist': 'Minimaliste',
    'watercolor': 'Aquarelle',
    'tribal': 'Tribal',
    'japanese': 'Japonais',
    'other': 'Autre'
  };

  const sizes = {
    'small': 'Petite (< 5cm)',
    'medium': 'Moyenne (5-15cm)', 
    'large': 'Grande (> 15cm)'
  };

  let message = `🎨 **NOUVEAU PROJET DE TATOUAGE**\n\n`;
  
  if (projectData.projectType) {
    message += `**Type :** ${projectTypes[projectData.projectType] || projectData.projectType}\n`;
  }
  
  if (projectData.bodyZone) {
    message += `**Zone :** ${bodyZones[projectData.bodyZone] || projectData.bodyZone}\n`;
  }
  
  if (projectData.style) {
    message += `**Style :** ${styles[projectData.style] || projectData.style}\n`;
  }
  
  if (projectData.size) {
    message += `**Taille :** ${sizes[projectData.size] || projectData.size}\n`;
  }
  
  if (projectData.description) {
    message += `\n**Description :**\n${projectData.description}\n`;
  }
  
  if (projectData.budget) {
    message += `\n**Budget :** ${projectData.budget}\n`;
  }
  
  if (projectData.availability) {
    message += `**Disponibilités :** ${projectData.availability}\n`;
  }
  
  if (projectData.isIntimate) {
    message += `\n⚠️ **Zone intime** - Précautions particulières requises\n`;
  }
  
  if (projectData.placementPhoto) {
    message += `\n📸 **Photo de placement fournie**\n`;
  }

  return message;
};

// Obtenir ou créer une conversation entre un client et un tatoueur
exports.getOrCreateConversation = async (req, res) => {
  try {
    let { tattooArtistId, projectType = 'autre', projectData } = req.body;
    
    // Parsing des données de projet si elles viennent en JSON string
    if (typeof projectData === 'string') {
      try {
        projectData = JSON.parse(projectData);
      } catch (e) {
        console.error('Erreur parsing projectData:', e);
        projectData = null;
      }
    }
    
    const clientId = req.user.id;

    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent initier des conversations' });
    }

    // Vérifier que le tatoueur existe
    const tattooArtist = await User.findById(tattooArtistId);
    if (!tattooArtist || tattooArtist.role !== 'tattoo_artist') {
      return res.status(404).json({ message: 'Tatoueur introuvable' });
    }

    // Chercher une conversation existante
    let conversation = await Conversation.findOne({
      participants: { $all: [clientId, tattooArtistId] }
    });

    // Créer une nouvelle conversation si elle n'existe pas
    if (!conversation) {
      conversation = new Conversation({
        participants: [clientId, tattooArtistId],
        client: clientId,
        tattooArtist: tattooArtistId,
        projectType: projectType,
        status: 'active'
      });
      await conversation.save();
    }

    // Créer un message projet si des données sont fournies
    if (projectData) {
      const messageContent = createProjectMessage(projectData);
      
      const message = new Message({
        conversation: conversation._id,
        sender: clientId,
        content: messageContent,
        type: 'project',
        projectData: projectData
      });
      
      // Gérer l'upload de photo si présent
      if (req.file) {
        message.attachments = [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        }];
      }
      
      await message.save();
      
      // Mettre à jour la conversation
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    res.status(200).json({ 
      conversation: conversation,
      message: 'Conversation créée avec succès'
    });

  } catch (error) {
    console.error('Erreur création conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les conversations d'un utilisateur
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const conversations = await Conversation.find({
      participants: userId,
      status: 'active'
    })
    .populate('participants', 'name email role specialty slug')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    // Formater les conversations pour le frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      
      return {
        id: conv._id,
        otherParticipantId: otherParticipant._id,
        otherParticipantName: otherParticipant.name || otherParticipant.slug || otherParticipant.email,
        otherParticipantAvatar: otherParticipant.name ? otherParticipant.name.charAt(0).toUpperCase() : 'U',
        specialty: otherParticipant.specialty || 'Non spécifié',
        lastMessage: conv.lastMessage ? conv.lastMessage.content.substring(0, 100) + '...' : 'Nouvelle conversation',
        lastMessageTime: conv.lastActivity,
        unreadCount: 0, // À implémenter si nécessaire
        isOnline: false, // À implémenter si nécessaire
        status: conv.status,
        projectType: conv.projectType
      };
    });

    res.status(200).json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les messages d'une conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    // Récupérer les messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    // Formater les messages pour le frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      type: msg.type,
      projectData: msg.projectData,
      attachments: msg.attachments,
      sender: {
        id: msg.sender._id,
        name: msg.sender.name,
        role: msg.sender.role
      },
      timestamp: msg.createdAt,
      isOwn: msg.sender._id.toString() === userId
    }));

    res.status(200).json({ messages: formattedMessages });

  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const senderId = req.user.id;

    // Vérifier la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    // Créer le message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content: content,
      type: type
    });

    await message.save();
    await message.populate('sender', 'name email role');

    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Formater la réponse
    const formattedMessage = {
      id: message._id,
      content: message.content,
      type: message.type,
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        role: message.sender.role
      },
      timestamp: message.createdAt,
      isOwn: true
    };

    res.status(201).json({ message: formattedMessage });

  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer les messages comme lus
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Marquer tous les messages de la conversation comme lus
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      { 
        $push: { 
          readBy: { 
            user: userId, 
            readAt: new Date() 
          } 
        } 
      }
    );

    res.status(200).json({ message: 'Messages marqués comme lus' });

  } catch (error) {
    console.error('Erreur marquage lecture:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer le nombre de messages non lus
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      'conversation.participants': userId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId }
    });

    res.status(200).json({ unreadCount });

  } catch (error) {
    console.error('Erreur comptage non lus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les tatoueurs disponibles
exports.getTattooArtists = async (req, res) => {
  try {
    const artists = await User.find(
      { role: 'tattoo_artist', isPublicPageActive: true },
      'name email specialty slug bio profilePhoto'
    );

    res.status(200).json({ artists });

  } catch (error) {
    console.error('Erreur récupération tatoueurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un tatoueur par son slug
exports.getTattooArtistBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const artist = await User.findOne(
      { slug: slug, role: 'tattoo_artist', isPublicPageActive: true },
      'name email specialty slug bio profilePhoto portfolio instagram phone address city'
    );

    if (!artist) {
      return res.status(404).json({ message: 'Tatoueur introuvable ou page non active' });
    }

    res.status(200).json({ artist });

  } catch (error) {
    console.error('Erreur récupération tatoueur par slug:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = exports;