const { Conversation, Message } = require('../models/Chat');
const User = require('../models/User');
const PublicPage = require('../models/PublicPage');
const mongoose = require('mongoose');

// Fonction pour formater un message de projet tatouage avec du CSS sombre et moderne
const createProjectMessage = (projectData) => {
  const projectTypes = {
    'first': 'Premier tatouage',
    'addition': 'Ajout à une collection',
    'coverup': 'Cover-up',
    'touchup': 'Retouche',
    'autre': 'Autre'
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

  const message = `
<div style="
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin: 12px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid #4a5568;
  max-width: 400px;
">
  <!-- Header -->
  <div style="
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #4a5568;
  ">
    <div style="
      background: #3182ce;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    ">
      <span style="font-size: 16px;">🎨</span>
    </div>
    <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">Demande de tatouage</h4>
  </div>

  <!-- Infos principales -->
  <div style="margin-bottom: 16px;">
    ${projectData.projectType ? `
    <div style="margin-bottom: 8px;">
      <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Type</span>
      <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${projectTypes[projectData.projectType] || projectData.projectType}</div>
    </div>` : ''}
    
    ${projectData.bodyZone ? `
    <div style="margin-bottom: 8px;">
      <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Zone</span>
      <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${bodyZones[projectData.bodyZone] || projectData.bodyZone}</div>
    </div>` : ''}
    
    ${projectData.style && projectData.size ? `
    <div style="display: flex; gap: 20px; margin-bottom: 8px;">
      <div style="flex: 1;">
        <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Style</span>
        <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${styles[projectData.style] || projectData.style}</div>
      </div>
      <div style="flex: 1;">
        <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Taille</span>
        <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${sizes[projectData.size] || projectData.size}</div>
      </div>
    </div>` : 
    `${projectData.style ? `
    <div style="margin-bottom: 8px;">
      <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Style</span>
      <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${styles[projectData.style] || projectData.style}</div>
    </div>` : ''}
    ${projectData.size ? `
    <div style="margin-bottom: 8px;">
      <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Taille</span>
      <div style="font-size: 14px; color: #ffffff; margin-top: 2px;">${sizes[projectData.size] || projectData.size}</div>
    </div>` : ''}`}
  </div>

  <!-- Description -->
  ${projectData.description ? `
  <div style="
    background: #1a202c;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #4a5568;
  ">
    <span style="font-size: 12px; color: #a0aec0; text-transform: uppercase; font-weight: 500;">Description</span>
    <p style="
      margin: 6px 0 0 0;
      font-size: 14px;
      line-height: 1.4;
      color: #e2e8f0;
    ">${projectData.description}</p>
  </div>` : ''}

  <!-- Budget et Disponibilités -->
  ${(projectData.budget || projectData.availability) ? `
  <div style="display: flex; gap: 12px; margin-bottom: 12px;">
    ${projectData.budget ? `
    <div style="
      flex: 1;
      background: #1a202c;
      border-radius: 6px;
      padding: 8px;
      border: 1px solid #4a5568;
    ">
      <span style="font-size: 11px; color: #68d391; text-transform: uppercase; font-weight: 600;">Budget</span>
      <div style="font-size: 13px; color: #ffffff; margin-top: 2px;">${projectData.budget}</div>
    </div>` : ''}
    
    ${projectData.availability ? `
    <div style="
      flex: 1;
      background: #1a202c;
      border-radius: 6px;
      padding: 8px;
      border: 1px solid #4a5568;
    ">
      <span style="font-size: 11px; color: #63b3ed; text-transform: uppercase; font-weight: 600;">Disponibilités</span>
      <div style="font-size: 13px; color: #ffffff; margin-top: 2px;">${projectData.availability}</div>
    </div>` : ''}
  </div>` : ''}

  <!-- Notes importantes -->
  ${(projectData.isIntimate || projectData.placementPhoto) ? `
  <div style="
    background: #2d3748;
    border: 1px solid #f6ad55;
    border-radius: 6px;
    padding: 8px;
  ">
    <span style="font-size: 11px; color: #f6ad55; text-transform: uppercase; font-weight: 600;">Notes</span>
    <div style="margin-top: 4px;">
      ${projectData.isIntimate ? '<div style="font-size: 12px; color: #fbb6ce;">🔒 Zone intime</div>' : ''}
      ${projectData.placementPhoto ? '<div style="font-size: 12px; color: #fbb6ce;">📸 Photo fournie</div>' : ''}
    </div>
  </div>` : ''}

</div>`;

  return message;
};

// Fonction utilitaire pour nettoyer le HTML et créer un aperçu propre
const createMessagePreview = (message) => {
  if (!message || !message.content) {
    return 'Nouvelle conversation';
  }

  // Si c'est un message de type 'project', créer un aperçu personnalisé
  if (message.type === 'project') {
    return '🎨 Nouvelle demande de tatouage';
  }

  // Pour les messages texte normaux, retourner le contenu tel quel
  if (message.type === 'text' || !message.type) {
    return message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');
  }

  // Pour d'autres types de messages
  return message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');
};

// Créer une conversation publique (sans authentification requise) - POUR LES DEMANDES DE PROJETS
exports.createPublicConversation = async (req, res) => {
  try {
    let { tattooArtistId, tattooArtistSlug, projectType = 'autre', projectData, clientName, clientEmail } = req.body;

    console.log('🔓 PUBLIC - Création conversation:', {
      tattooArtistId,
      tattooArtistSlug,
      projectType,
      hasProjectData: !!projectData,
      clientName,
      clientEmail
    });

    if (typeof projectData === 'string') {
      try {
        projectData = JSON.parse(projectData);
      } catch {
        projectData = null;
      }
    }

    // Validation des données requises
    if (!clientName || !clientEmail) {
      return res.status(400).json({ message: 'Nom et email du client requis' });
    }

    // Trouver ou créer le client
    let client = await User.findOne({ email: clientEmail.toLowerCase() });
    
    if (!client) {
      // Créer un nouveau client
      client = new User({
        name: clientName,
        email: clientEmail.toLowerCase(),
        role: 'client',
        password: 'temp_' + Math.random().toString(36).substring(2, 15)
      });
      await client.save();
    }

    // Recherche du tatoueur (même logique que getOrCreateConversation)
    let tattooArtist = null;
    if (tattooArtistSlug) {
      tattooArtist = await User.findOne({
        slug: tattooArtistSlug.toLowerCase(),
        role: 'tattoo_artist'
      });
      if (!tattooArtist) {
        tattooArtist = await User.findOne({
          name: { $regex: new RegExp(tattooArtistSlug.replace('-', ' '), 'i') },
          role: 'tattoo_artist'
        });
      }
      if (tattooArtist) {
        tattooArtistId = tattooArtist._id;
      }
    } else if (tattooArtistId && mongoose.Types.ObjectId.isValid(tattooArtistId)) {
      tattooArtist = await User.findById(tattooArtistId);
    }

    if (!tattooArtist) {
      return res.status(404).json({ message: 'Tatoueur non trouvé' });
    }

    // Créer ou récupérer la conversation
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [client._id, tattooArtistId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { userId: client._id, role: 'client' },
          { userId: tattooArtistId, role: 'tattoo_artist' }
        ],
        projectType: projectType
      });
      await conversation.save();
    }

    // Créer le message de projet
    if (projectData) {
      const messageContent = createProjectMessage(projectData);

      const message = new Message({
        conversationId: conversation._id,
        senderId: client._id,
        content: messageContent,
        type: 'project'
      });

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

      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    res.status(200).json({ 
      conversation: {
        _id: conversation._id,
        id: conversation._id,
        participants: conversation.participants,
        projectType: conversation.projectType
      }, 
      message: 'Demande envoyée avec succès'
    });

  } catch (error) {
    console.error('❌ PUBLIC - Erreur création conversation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer ou récupérer une conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const clientId = req.user.id;
    let { tattooArtistId, tattooArtistSlug, projectType = 'autre', projectData } = req.body;

    console.log('Debug création conversation:', {
      tattooArtistId,
      tattooArtistSlug,
      projectType,
      hasProjectData: !!projectData,
      clientId,
      body: req.body
    });

    if (typeof projectData === 'string') {
      try {
        projectData = JSON.parse(projectData);
      } catch {
        projectData = null;
      }
    }

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent initier des conversations' });
    }

    let tattooArtist = null;

    // Si on a un slug, chercher par slug d'abord
    if (tattooArtistSlug) {
      
      tattooArtist = await User.findOne({
        slug: tattooArtistSlug.toLowerCase(),
        role: 'tattoo_artist'
      });

      if (!tattooArtist) {
        // Essayer par nom si le slug ne marche pas
        tattooArtist = await User.findOne({
          name: { $regex: new RegExp(tattooArtistSlug.replace('-', ' '), 'i') },
          role: 'tattoo_artist'
        });
      }

      if (tattooArtist) {
        tattooArtistId = tattooArtist._id;
      } else {
        
        // Vérifier tous les tatoueurs disponibles pour debug
        const allArtists = await User.find({ role: 'tattoo_artist' }, 'name slug');
        console.log('Debug tatoueurs disponibles:', allArtists);
        
        return res.status(404).json({ message: 'Tatoueur non trouvé' });
      }
    }
    // Sinon, chercher par ID
    else if (tattooArtistId && mongoose.Types.ObjectId.isValid(tattooArtistId)) {
      tattooArtist = await User.findOne({
        _id: tattooArtistId,
        role: 'tattoo_artist'
      });
      
      if (!tattooArtist) {
        console.log('Debug: Tatoueur non trouvé par ID:', tattooArtistId);
        return res.status(404).json({ message: 'Tatoueur non trouvé avec cet ID' });
      }
    } else {
      return res.status(400).json({ message: 'ID ou slug de tatoueur requis' });
    }

    if (!tattooArtist) {
      return res.status(404).json({ message: 'Tatoueur non trouvé' });
    }

    if (tattooArtist.role !== 'tattoo_artist') {
      return res.status(400).json({ message: `Cet utilisateur n'est pas un tatoueur (rôle: ${tattooArtist.role})` });
    }

    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [clientId, tattooArtistId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { userId: clientId, role: 'client' },
          { userId: tattooArtistId, role: 'tattoo_artist' }
        ],
        projectType: projectType
      });
      await conversation.save();
    } else {
    }

    if (projectData) {
      const messageContent = createProjectMessage(projectData);

      const message = new Message({
        conversationId: conversation._id,
        senderId: clientId,
        content: messageContent,
        type: 'project'
      });

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

      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    // SUPPRESSION du message automatique de confirmation selon votre demande

    res.status(200).json({ 
      conversation: {
        _id: conversation._id,
        id: conversation._id,
        participants: conversation.participants,
        projectType: conversation.projectType,
        lastMessage: conversation.lastMessage,
        lastActivity: conversation.lastActivity,
        isActive: conversation.isActive
      }, 
      message: 'Conversation créée avec succès' 
    });

  } catch (error) {
    console.error('Erreur création conversation:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer toutes les conversations d'un utilisateur
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Debug recherche artiste:', {
      userId, 
      userRole, 
      userName: req.user.name || req.user.email 
    });

    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    })
    .populate('participants.userId', 'name prenom nom email role specialty slug')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });


    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId && p.userId._id && p.userId._id.toString() !== userId);
      const otherUser = otherParticipant ? otherParticipant.userId : null;

      console.log('Debug conversation existante:', {
        convId: conv._id,
        participants: conv.participants.map(p => ({ 
          userId: p.userId ? p.userId._id : 'NO_ID', 
          name: p.userId ? p.userId.name : 'NO_NAME',
          prenom: p.userId ? p.userId.prenom : 'NO_PRENOM',
          role: p.role 
        })),
        otherParticipant: otherParticipant ? {
          role: otherParticipant.role,
          userId: otherParticipant.userId._id,
          name: otherParticipant.userId.name,
          prenom: otherParticipant.userId.prenom
        } : 'NO_OTHER_PARTICIPANT',
        lastMessage: conv.lastMessage ? {
          type: conv.lastMessage.type,
          content: conv.lastMessage.content?.substring(0, 50) + '...'
        } : 'NO_MESSAGE'
      });

      // Meilleure gestion des noms pour éviter "Utilisateur inconnu"
      let displayName = 'Utilisateur non trouvé';
      let avatarLetter = 'U';
      
      if (otherUser) {
        // Priorité: prenom + nom > name > email (partie avant @) > slug > défaut basé sur rôle
        if (otherUser.prenom && otherUser.nom) {
          displayName = `${otherUser.prenom} ${otherUser.nom}`.trim();
        } else if (otherUser.prenom) {
          displayName = otherUser.prenom.trim();
        } else if (otherUser.name && otherUser.name.trim()) {
          displayName = otherUser.name.trim();
        } else if (otherUser.email) {
          displayName = otherUser.email.split('@')[0];
        } else if (otherUser.slug) {
          displayName = otherUser.slug.replace('-', ' ');
        } else {
          displayName = otherUser.role === 'tattoo_artist' ? 'Tatoueur' : 'Client';
        }
        avatarLetter = displayName.charAt(0).toUpperCase();
      } else {
      }

      return {
        _id: conv._id,
        id: conv._id,
        participants: conv.participants,
        otherParticipantId: otherUser ? otherUser._id : null,
        otherParticipantName: displayName,
        otherParticipantAvatar: avatarLetter,
        otherParticipantRole: otherParticipant ? otherParticipant.role : null,
        specialty: otherUser ? (otherUser.specialty || 'Non spécifié') : 'Non spécifié',
        lastMessage: createMessagePreview(conv.lastMessage),
        lastMessageTime: conv.lastActivity || conv.createdAt,
        lastActivity: conv.lastActivity || conv.createdAt,
        unreadCount: 0,
        isActive: conv.isActive,
        projectType: conv.projectType || 'autre'
        // SUPPRESSION: isOnline retiré selon votre demande
      };
    });

    res.status(200).json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer messages d'une conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Debug récupération messages:', {
      conversationId, 
      userId, 
      userRole, 
      userName: req.user.name || req.user.email 
    });


    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'ID de conversation invalide' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    console.log('Debug participants:', conversation.participants.map(p => ({
      userId: p.userId,
      role: p.role
    })));

    if (!conversation.participants.some(p => p.userId.toString() === userId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    const messages = await Message.find({ conversationId: conversationId })
      .populate('senderId', 'name prenom nom email role slug')
      .sort({ createdAt: 1 });

    messages.forEach((msg, index) => {
      console.log(`Debug message ${index}:`, {
        id: msg._id,
        type: msg.type,
        senderId: msg.senderId._id,
        senderRole: msg.senderId.role,
        senderName: msg.senderId.name || msg.senderId.email,
        contentLength: msg.content?.length || 0,
        contentPreview: msg.content?.substring(0, 100) || 'NO_CONTENT',
        createdAt: msg.createdAt,
        isFromClient: msg.senderId.role === 'client'
      });
    });

    const formattedMessages = messages.map(msg => {
      // Meilleure gestion des noms pour éviter "Utilisateur inconnu"
      let senderName = 'Expéditeur';
      
      if (msg.senderId) {
        if (msg.senderId.prenom && msg.senderId.nom) {
          senderName = `${msg.senderId.prenom} ${msg.senderId.nom}`.trim();
        } else if (msg.senderId.prenom) {
          senderName = msg.senderId.prenom.trim();
        } else if (msg.senderId.name && msg.senderId.name.trim()) {
          senderName = msg.senderId.name.trim();
        } else if (msg.senderId.email) {
          senderName = msg.senderId.email.split('@')[0];
        } else if (msg.senderId.slug) {
          senderName = msg.senderId.slug.replace('-', ' ');
        } else {
          senderName = msg.senderId.role === 'tattoo_artist' ? 'Tatoueur' : 'Client';
        }
      }
      
      return {
        id: msg._id,
        senderId: msg.senderId._id,
        senderName: senderName,
        content: msg.content,
        type: msg.type,
        attachments: msg.attachments || [],
        sender: {
          id: msg.senderId._id,
          name: senderName,
          role: msg.senderId.role
        },
        timestamp: msg.createdAt,
        isOwn: msg.senderId._id.toString() === userId
      };
    });

    res.status(200).json({ messages: formattedMessages });

  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;
    const senderId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.userId.toString() === senderId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    const message = new Message({
      conversationId: conversationId,
      senderId: senderId,
      content,
      type
    });

    await message.save();
    await message.populate('senderId', 'name prenom nom email role slug');

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Meilleure gestion des noms pour éviter "Utilisateur inconnu"
    let senderName = 'Expéditeur';
    
    if (message.senderId) {
      if (message.senderId.prenom && message.senderId.nom) {
        senderName = `${message.senderId.prenom} ${message.senderId.nom}`.trim();
      } else if (message.senderId.prenom) {
        senderName = message.senderId.prenom.trim();
      } else if (message.senderId.name && message.senderId.name.trim()) {
        senderName = message.senderId.name.trim();
      } else if (message.senderId.email) {
        senderName = message.senderId.email.split('@')[0];
      } else if (message.senderId.slug) {
        senderName = message.senderId.slug.replace('-', ' ');
      } else {
        senderName = message.senderId.role === 'tattoo_artist' ? 'Tatoueur' : 'Client';
      }
    }

    res.status(201).json({
      message: {
        id: message._id,
        content: message.content,
        type: message.type,
        sender: {
          id: message.senderId._id,
          name: senderName,
          role: message.senderId.role
        },
        timestamp: message.createdAt,
        isOwn: true
      }
    });

  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer les messages d'une conversation comme lus
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { 
        conversationId: conversationId,
        senderId: { $ne: userId },
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
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

    const conversations = await Conversation.find({ 'participants.userId': userId }).select('_id');
    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      isRead: false
    });

    res.status(200).json({ unreadCount });

  } catch (error) {
    console.error('Erreur comptage non lus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les tatoueurs
exports.getTattooArtists = async (req, res) => {
  try {
    const artists = await User.find(
      { 
        role: 'tattoo_artist',
        $or: [
          { isPublicPageActive: true },
          { isPublicPageActive: { $exists: false } }
        ]
      },
      'name slug specialty bio instagram profilePhoto'
    ).lean();

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

    // Essayer d'abord avec une page publique
    const page = await PublicPage.findOne({ 
      slug: slug.toLowerCase(), 
      isActive: true 
    }).populate('userId', 'name slug bio instagram profilePhoto specialty');

    if (page) {
      return res.json(page);
    }

    // Sinon chercher directement dans les utilisateurs
    const tattooArtist = await User.findOne({
      slug: slug.toLowerCase(),
      role: 'tattoo_artist',
      $or: [
        { isPublicPageActive: true },
        { isPublicPageActive: { $exists: false } }
      ]
    }).select('name slug bio instagram profilePhoto specialty');

    if (tattooArtist) {
      return res.json(tattooArtist);
    }

    // Dernier recours : chercher par nom
    const artistByName = await User.findOne({
      name: { $regex: new RegExp(slug.replace('-', ' '), 'i') },
      role: 'tattoo_artist'
    }).select('name slug bio instagram profilePhoto specialty');

    return res.json(artistByName || null);

  } catch (error) {
    console.error('Erreur récupération tatoueur par slug:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
