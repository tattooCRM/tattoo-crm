const ClientProfile = require('../models/ClientProfile');
const User = require('../models/User');

// Obtenir tous les clients pour un tatoueur
exports.getClients = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    
    const clients = await ClientProfile.find({ tattooArtistId })
      .populate('userId', 'nom prenom email createdAt')
      .populate('projets')
      .populate('devis')
      .sort({ lastActivityAt: -1 });
    
    res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir un client spécifique
exports.getClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const tattooArtistId = req.user.id;
    
    const client = await ClientProfile.findOne({ 
      _id: clientId, 
      tattooArtistId 
    })
      .populate('userId')
      .populate('projets')
      .populate('devis');
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    const clientData = req.body;
    
    // Vérifier si un client avec cet email existe déjà pour ce tatoueur
    const existingClient = await ClientProfile.findOne({
      email: clientData.email.toLowerCase(),
      tattooArtistId
    });
    
    if (existingClient) {
      return res.status(400).json({ 
        message: 'Un client avec cet email existe déjà dans votre base' 
      });
    }
    
    const client = new ClientProfile({
      ...clientData,
      tattooArtistId,
      email: clientData.email.toLowerCase(),
      statut: 'prospect'
    });
    
    await client.save();
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const tattooArtistId = req.user.id;
    const updates = req.body;
    
    const client = await ClientProfile.findOneAndUpdate(
      { _id: clientId, tattooArtistId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const tattooArtistId = req.user.id;
    
    const client = await ClientProfile.findOneAndDelete({
      _id: clientId,
      tattooArtistId
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les statistiques des clients
exports.getClientStats = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    
    const stats = await ClientProfile.aggregate([
      { $match: { tattooArtistId: tattooArtistId } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          nouveauxCeMois: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                1,
                0
              ]
            }
          },
          chiffreAffaireTotal: { $sum: '$statistiques.montantTotal' },
          moyenneProjetParClient: { $avg: '$statistiques.nombreProjets' }
        }
      }
    ]);
    
    const statusDistribution = await ClientProfile.aggregate([
      { $match: { tattooArtistId: tattooArtistId } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);
    
    res.json({
      global: stats[0] || {
        totalClients: 0,
        nouveauxCeMois: 0,
        chiffreAffaireTotal: 0,
        moyenneProjetParClient: 0
      },
      statusDistribution
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer ou mettre à jour un profil client automatiquement
exports.createOrUpdateClientProfile = async (userId, tattooArtistId) => {
  try {
    console.log('🧑‍🎤 Création/mise à jour du profil client:', { userId, tattooArtistId });
    
    // Vérifier si le profil existe déjà
    let clientProfile = await ClientProfile.findOne({ 
      userId: userId, 
      tattooArtistId: tattooArtistId 
    });
    
    if (clientProfile) {
      // Mettre à jour la dernière activité
      clientProfile.lastActivityAt = new Date();
      // Incrémenter le nombre de projets si c'est un nouveau projet
      await clientProfile.save();
      console.log('✅ Profil client mis à jour:', clientProfile._id);
      return clientProfile;
    }
    
    // Récupérer les informations de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Créer le nouveau profil client
    clientProfile = new ClientProfile({
      userId: user._id,
      tattooArtistId: tattooArtistId,
      nom: user.nom || 'Nom',
      prenom: user.prenom || 'Prénom',
      email: user.email,
      phone: user.phone,
      statut: 'prospect',
      source: 'website',
      statistiques: {
        premierContact: new Date(),
        nombreProjets: 0,
        nombreTatouages: 0,
        montantTotal: 0
      }
    });
    
    await clientProfile.save();
    console.log('✅ Nouveau profil client créé:', clientProfile._id);
    return clientProfile;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du profil client:', error);
    throw error;
  }
};

module.exports = exports;
