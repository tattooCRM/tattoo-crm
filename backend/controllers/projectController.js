const Project = require('../models/Project');
const Quote = require('../models/Quote');
const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');
const { Conversation, Message } = require('../models/Chat');

// Obtenir tous les projets pour un tatoueur
exports.getProjects = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    
    const projects = await Project.find({ tattooArtistId })
      .populate('clientId', 'nom prenom email phone')
      .populate('quoteId', 'quoteNumber totalAmount')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir un projet spécifique
exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tattooArtistId = req.user.id;
    
    const project = await Project.findOne({ 
      _id: projectId, 
      tattooArtistId 
    })
      .populate('clientId', 'nom prenom email phone')
      .populate('quoteId')
      .populate('revisions.requestedBy', 'nom prenom');
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un projet à partir d'un devis accepté
exports.createProjectFromQuote = async (quoteId) => {
  try {
    console.log('🎯 Création du projet à partir du devis:', quoteId);
    
    // Récupérer le devis
    const quote = await Quote.findById(quoteId)
      .populate('tattooArtistId')
      .populate('clientId');
    
    if (!quote) {
      throw new Error('Devis non trouvé');
    }
    
    if (quote.status !== 'accepted') {
      throw new Error('Le devis doit être accepté pour créer un projet');
    }
    
    // Vérifier si un projet existe déjà pour ce devis
    const existingProject = await Project.findOne({ quoteId: quote._id });
    if (existingProject) {
      console.log('✅ Projet déjà existant:', existingProject.projectNumber);
      return existingProject;
    }
    
    // Générer un numéro de projet unique
    const projectNumber = await Project.generateProjectNumber();
    
    // Créer le projet
    const project = new Project({
      projectNumber,
      tattooArtistId: quote.tattooArtistId._id,
      clientId: quote.clientId._id,
      quoteId: quote._id,
      conversationId: quote.conversationId,
      title: quote.title || 'Nouveau Projet Tatouage',
      description: quote.notes || 'Projet créé à partir du devis ' + quote.quoteNumber,
      style: 'other', // À définir par l'artiste
      bodyZone: 'other', // À définir par l'artiste
      size: 'medium', // À définir par l'artiste
      estimatedDuration: 4, // Par défaut
      sessionCount: 1,
      totalAmount: quote.totalAmount,
      status: 'design_phase',
      acceptedAt: new Date(),
      clientNotes: 'Projet créé automatiquement suite à l\'acceptation du devis',
      artistNotes: 'Finaliser les détails du design avec le client'
    });
    
    await project.save();
    console.log('✅ Projet créé:', project.projectNumber);
    
    // Créer ou mettre à jour le profil client
    try {
      let clientProfile = await ClientProfile.findOne({ 
        userId: quote.clientId._id, 
        tattooArtistId: quote.tattooArtistId._id 
      });
      
      if (!clientProfile) {
        clientProfile = await ClientProfile.createFromUser(
          quote.clientId._id, 
          quote.tattooArtistId._id
        );
        console.log('✅ Profil client créé:', clientProfile._id);
      }
      
      // Mettre à jour les statistiques du client
      clientProfile.statistiques.nombreProjets += 1;
      clientProfile.statistiques.montantTotal += quote.totalAmount;
      clientProfile.statistiques.dernierContact = new Date();
      clientProfile.lastActivityAt = new Date();
      clientProfile.statut = 'client'; // Passer de prospect à client
      
      // Ajouter le projet à l'historique
      clientProfile.projets.push(project._id);
      clientProfile.devis.push(quote._id);
      
      await clientProfile.save();
      console.log('✅ Profil client mis à jour');
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du profil client:', error);
      // Ne pas faire échouer la création du projet pour autant
    }
    
    // Envoyer un message de confirmation dans la conversation
    if (quote.conversationId) {
      const confirmationMessage = new Message({
        conversationId: quote.conversationId,
        senderId: quote.tattooArtistId._id,
        senderName: `${quote.tattooArtistId.nom} ${quote.tattooArtistId.prenom}`,
        content: `🎉 Excellent ! Votre devis a été accepté et le projet **${project.projectNumber}** a été créé. Je vais maintenant finaliser le design avec vous. N'hésitez pas à me faire part de vos préférences !`,
        type: 'system',
        metadata: {
          projectId: project._id,
          projectNumber: project.projectNumber,
          messageType: 'project_created'
        }
      });
      
      await confirmationMessage.save();
      
      // Mettre à jour la conversation
      const conversation = await Conversation.findById(quote.conversationId);
      if (conversation) {
        conversation.lastMessage = confirmationMessage._id;
        conversation.lastActivity = new Date();
        await conversation.save();
      }
    }
    
    return project;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du projet:', error);
    throw error;
  }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tattooArtistId = req.user.id;
    const updates = req.body;
    
    const project = await Project.findOneAndUpdate(
      { _id: projectId, tattooArtistId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('clientId', 'nom prenom email');
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter une session au projet
exports.addSession = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tattooArtistId = req.user.id;
    const sessionData = req.body;
    
    const project = await Project.findOne({ _id: projectId, tattooArtistId });
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    const sessionNumber = project.sessions.length + 1;
    project.sessions.push({
      sessionNumber,
      ...sessionData
    });
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la session:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = exports;
