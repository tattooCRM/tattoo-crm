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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 600px;
  border: 1px solid rgba(255,255,255,0.1);
">
  <div style="
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(255,255,255,0.15);
  ">
    <h2 style="
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    ">🎨 DEMANDE DE PROJET</h2>
  </div>

  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  ">
    ${projectData.projectType ? `
    <div style="
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.15);
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 20px; margin-right: 8px;">📋</span>
        <strong style="font-size: 14px; opacity: 0.9;">Type de projet</strong>
      </div>
      <div style="font-size: 16px; font-weight: 600;">
        ${projectTypes[projectData.projectType] || projectData.projectType}
      </div>
    </div>` : ''}
    
    ${projectData.bodyZone ? `
    <div style="
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.15);
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 20px; margin-right: 8px;">📍</span>
        <strong style="font-size: 14px; opacity: 0.9;">Zone du corps</strong>
      </div>
      <div style="font-size: 16px; font-weight: 600;">
        ${bodyZones[projectData.bodyZone] || projectData.bodyZone}
      </div>
    </div>` : ''}
    
    ${projectData.style ? `
    <div style="
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.15);
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 20px; margin-right: 8px;">🎭</span>
        <strong style="font-size: 14px; opacity: 0.9;">Style</strong>
      </div>
      <div style="font-size: 16px; font-weight: 600;">
        ${styles[projectData.style] || projectData.style}
      </div>
    </div>` : ''}
    
    ${projectData.size ? `
    <div style="
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.15);
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 20px; margin-right: 8px;">📐</span>
        <strong style="font-size: 14px; opacity: 0.9;">Taille</strong>
      </div>
      <div style="font-size: 16px; font-weight: 600;">
        ${sizes[projectData.size] || projectData.size}
      </div>
    </div>` : ''}
  </div>

  ${projectData.description ? `
  <div style="
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #00D4FF;
  ">
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 22px; margin-right: 8px;">💭</span>
      <strong style="font-size: 16px;">Description du projet</strong>
    </div>
    <p style="
      margin: 0;
      line-height: 1.6;
      font-size: 15px;
      opacity: 0.95;
    ">${projectData.description}</p>
  </div>` : ''}

  ${(projectData.budget || projectData.availability) ? `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 20px 0;
  ">
    ${projectData.budget ? `
    <div style="
      background: rgba(0, 255, 127, 0.1);
      border-radius: 8px;
      padding: 12px;
      border-left: 3px solid #00FF7F;
    ">
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 8px;">💰</span>
        <strong style="margin-right: 8px;">Budget:</strong>
        <span>${projectData.budget}</span>
      </div>
    </div>` : ''}
    
    ${projectData.availability ? `
    <div style="
      background: rgba(0, 191, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      border-left: 3px solid #00BFFF;
    ">
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 8px;">⏰</span>
        <strong style="margin-right: 8px;">Disponibilités:</strong>
        <span>${projectData.availability}</span>
      </div>
    </div>` : ''}
  </div>` : ''}

  ${(projectData.isIntimate || projectData.placementPhoto) ? `
  <div style="
    background: rgba(255, 193, 7, 0.1);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid rgba(255, 193, 7, 0.3);
    margin-top: 16px;
  ">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
      <strong>Notes importantes</strong>
    </div>
    ${projectData.isIntimate ? '<div>🔒 Zone intime - précautions particulières requises</div>' : ''}
    ${projectData.placementPhoto ? '<div>📸 Photo de placement fournie</div>' : ''}
  </div>` : ''}


</div>`;

  return message;
};

// Créer ou récupérer une conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const clientId = req.user.id;
    let { tattooArtistId, projectType = 'autre', projectData } = req.body;

    console.log(`📝 Nouvelle demande de conversation:`, {
      clientId,
      tattooArtistId,
      projectType,
      hasProjectData: !!projectData,
      userRole: req.user.role
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

    // Vérifier si l'ID du tatoueur est valide
    if (!tattooArtistId || !mongoose.Types.ObjectId.isValid(tattooArtistId)) {
      return res.status(400).json({ message: 'ID de tatoueur invalide' });
    }

    console.log(`🔍 Recherche tatoueur avec ID: ${tattooArtistId}`);
    
    const tattooArtist = await User.findById(tattooArtistId);
    console.log(`Tatoueur trouvé:`, tattooArtist ? tattooArtist.name : 'Non trouvé');
    
    if (!tattooArtist) {
      console.log(`⚠️ Tatoueur non trouvé avec l'ID ${tattooArtistId}, mais on va quand même créer une conversation pour permettre le contact hors ligne`);
    } else if (tattooArtist.role !== 'tattoo_artist') {
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
    console.log(`📋 Récupération des conversations pour l'utilisateur: ${userId}`);

    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    })
    .populate('participants.userId', 'name email role specialty slug')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    console.log(`📋 Trouvé ${conversations.length} conversations`);

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId && p.userId._id && p.userId._id.toString() !== userId);
      const otherUser = otherParticipant ? otherParticipant.userId : null;

      // FIX: Meilleure gestion des noms pour éviter "Utilisateur inconnu"
      let displayName = 'Utilisateur inconnu';
      if (otherUser) {
        displayName = otherUser.name || otherUser.slug || otherUser.email || 'Utilisateur inconnu';
      }

      return {
        _id: conv._id,
        id: conv._id,
        participants: conv.participants,
        otherParticipantId: otherUser ? otherUser._id : null,
        otherParticipantName: displayName,
        otherParticipantAvatar: displayName.charAt(0).toUpperCase(),
        otherParticipantRole: otherParticipant ? otherParticipant.role : null,
        specialty: otherUser ? (otherUser.specialty || 'Non spécifié') : 'Non spécifié',
        lastMessage: conv.lastMessage ? conv.lastMessage.content.substring(0, 100) + '...' : 'Nouvelle conversation',
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

    console.log(`📨 Récupération des messages pour conversation: ${conversationId}, utilisateur: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.log(`❌ ID de conversation invalide: ${conversationId}`);
      return res.status(400).json({ message: 'ID de conversation invalide' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log(`❌ Conversation non trouvée: ${conversationId}`);
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    if (!conversation.participants.some(p => p.userId.toString() === userId)) {
      console.log(`❌ Accès non autorisé pour l'utilisateur: ${userId}`);
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    const messages = await Message.find({ conversationId: conversationId })
      .populate('senderId', 'name email role slug')
      .sort({ createdAt: 1 });

    console.log(`📝 Trouvé ${messages.length} messages`);

    const formattedMessages = messages.map(msg => {
      // FIX: Meilleure gestion des noms pour éviter "Utilisateur inconnu"
      const senderName = msg.senderId?.name || msg.senderId?.slug || msg.senderId?.email || 'Utilisateur inconnu';
      
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

    console.log(`✅ Messages formatés: ${formattedMessages.length}`);
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
    await message.populate('senderId', 'name email role slug');

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // FIX: Meilleure gestion des noms pour éviter "Utilisateur inconnu"
    const senderName = message.senderId?.name || message.senderId?.slug || message.senderId?.email || 'Utilisateur inconnu';

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

    console.log(`🎨 Trouvé ${artists.length} tatoueurs disponibles`);
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
    console.log(`🔍 Recherche tatoueur avec slug: "${slug}"`);

    // Essayer d'abord avec une page publique
    const page = await PublicPage.findOne({ 
      slug: slug.toLowerCase(), 
      isActive: true 
    }).populate('userId', 'name slug bio instagram profilePhoto specialty');

    if (page) {
      console.log(`✅ Page publique trouvée pour: ${slug}`);
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
      console.log(`✅ Tatoueur trouvé: ${tattooArtist.name}`);
      return res.json(tattooArtist);
    }

    // Dernier recours : chercher par nom
    const artistByName = await User.findOne({
      name: { $regex: new RegExp(slug.replace('-', ' '), 'i') },
      role: 'tattoo_artist'
    }).select('name slug bio instagram profilePhoto specialty');

    console.log(artistByName ? `✅ Tatoueur trouvé par nom: ${artistByName.name}` : `❌ Aucun tatoueur trouvé pour: ${slug}`);
    return res.json(artistByName || null);

  } catch (error) {
    console.error('Erreur récupération tatoueur par slug:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
