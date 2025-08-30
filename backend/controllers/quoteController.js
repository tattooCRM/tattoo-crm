const Quote = require('../models/Quote');
const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');
const Project = require('../models/Project');
const { Conversation, Message } = require('../models/Chat');
const path = require('path');
const fs = require('fs');
const { generateQuotePDF } = require('../utils/pdfGenerator');

// Créer un devis
exports.createQuote = async (req, res) => {
  try {
    // Support pour les deux formats: nouveau (API simple) et ancien (frontend complexe)
    let clientName, clientEmail, clientPhone, tattooDescription, placement, size, style, colorPreference, services, notes, validUntil;

    if (req.body.clientInfo) {
      // Format frontend complexe
      clientName = req.body.clientInfo.name;
      clientEmail = req.body.clientInfo.email;
      clientPhone = req.body.clientInfo.phone;
      tattooDescription = req.body.notes || 'Tatouage personnalisé';
      placement = 'Non spécifié';
      size = 'Moyen';
      style = 'Personnalisé';
      colorPreference = 'Couleur';
      
      // Convertir les items en services
      services = req.body.items?.map(item => ({
        name: item.description || 'Service',
        description: item.description || 'Service de tatouage',
        price: item.unitPrice || item.totalPrice || 0,
        quantity: item.quantity || 1
      })) || [];
      
      notes = req.body.notes;
      validUntil = req.body.validUntil;
    } else {
      // Format API simple
      ({
        clientName,
        clientEmail,
        clientPhone,
        tattooDescription,
        placement,
        size,
        style,
        colorPreference,
        services,
        notes,
        validUntil
      } = req.body);
    }

    console.log('Creating quote with data:', req.body);

    // Validation des champs requis
    if (!clientName || !clientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email du client sont requis',
        error: 'Validation failed: clientName and clientEmail are required'
      });
    }

    // 1. Trouver ou créer un utilisateur client
    let client = await User.findOne({ email: clientEmail });
    if (!client) {
      // Créer un utilisateur client temporaire avec mot de passe par défaut
      const bcrypt = require('bcrypt');
      const defaultPassword = await bcrypt.hash('temp123', 10);
      
      client = new User({
        email: clientEmail,
        name: clientName,
        password: defaultPassword,
        role: 'client',
        isActive: true,
        profile: {
          phone: clientPhone
        }
      });
      await client.save();
      console.log('Client créé:', client._id);
    }

    // 2. Créer une conversation fictive (nécessaire pour le modèle Quote)
    const conversation = new Conversation({
      participants: [
        { userId: req.user.id, role: 'tattoo_artist' },
        { userId: client._id, role: 'client' }
      ],
      isActive: true,
      createdAt: new Date()
    });
    await conversation.save();
    console.log('Conversation créée:', conversation._id);

    // 3. Convertir les services en items pour le modèle Quote
    const items = services.map(service => ({
      description: `${service.name} - ${service.description}`,
      quantity: service.quantity || 1,
      unitPrice: service.price,
      totalPrice: (service.price || 0) * (service.quantity || 1)
    }));

    // 4. Calculer les totaux
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0; // Pas de TVA par défaut
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // 5. Générer le numéro de devis
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Trouver le prochain numéro séquentiel pour ce tatoueur cette année
    const count = await Quote.countDocuments({
      tattooArtistId: req.user.id,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    
    const sequentialNumber = String(count + 1).padStart(3, '0');
    const quoteNumber = `DEV-${year}${month}-${sequentialNumber}`;

    // 6. Créer le devis selon le modèle attendu
    const quote = new Quote({
      quoteNumber: quoteNumber,
      tattooArtistId: req.user.id,
      clientId: client._id,
      conversationId: conversation._id,
      title: `Devis Tatouage - ${clientName}`,
      
      // Informations client
      clientInfo: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone
      },
      
      // Informations tatoueur
      artistInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.profile?.phone || ''
      },
      
      // Éléments du devis
      items: items,
      
      // Totaux
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      
      // Conditions
      notes: notes || `Tatouage: ${tattooDescription}\nPlacement: ${placement}\nTaille: ${size}\nStyle: ${style}\nCouleur: ${colorPreference}`,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      
      status: 'draft'
    });

    await quote.save();

    console.log('Quote created successfully:', quote._id);

    res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      quote: quote
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du devis',
      error: error.message
    });
  }
};

// Envoyer un devis
exports.sendQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Sending quote:', id);

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Vérifier que c'est bien l'artiste qui possède ce devis
    if (quote.tattooArtistId && quote.tattooArtistId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Mettre à jour le statut
    quote.status = 'sent';
    quote.sentAt = new Date();
    quote.updatedAt = new Date();
    await quote.save();

    console.log('Quote sent successfully:', id);

    res.json({
      success: true,
      message: 'Devis envoyé avec succès',
      quote: quote
    });

  } catch (error) {
    console.error('Error sending quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du devis',
      error: error.message
    });
  }
};

// Accepter un devis
exports.acceptQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Accepting quote:', id);

    const quote = await Quote.findById(id).populate('tattooArtistId', 'name email');
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Mettre à jour le statut du devis
    quote.status = 'accepted';
    quote.acceptedAt = new Date();
    quote.updatedAt = new Date();
    await quote.save();

    // Créer automatiquement un projet
    let project = null;
    let clientProfile = null;
    
    try {
      // Générer un numéro de projet unique
      const projectNumber = `PROJ-${Date.now().toString().slice(-8)}`;
      
      project = new Project({
        projectNumber,
        title: quote.title || `Projet - ${quote.clientInfo?.name || 'Client'}`,
        description: quote.notes || 'Projet créé automatiquement depuis un devis accepté',
        tattooArtistId: quote.tattooArtistId._id,
        clientId: quote.clientId,
        quoteId: quote._id,
        style: 'other', // Valeur par défaut
        bodyZone: 'other', // Valeur par défaut
        size: 'medium', // Valeur par défaut
        estimatedDuration: 4, // Valeur par défaut de 4 heures
        totalAmount: quote.totalAmount,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await project.save();
      console.log('Project created automatically:', project._id);

      // Créer automatiquement une fiche client si elle n'existe pas
      clientProfile = await ClientProfile.findOne({ 
        clientId: quote.clientId, 
        tattooArtistId: quote.tattooArtistId._id 
      });

      if (!clientProfile) {
        // Diviser le nom en prénom et nom si possible
        const fullName = quote.clientInfo?.name || 'Client';
        const nameParts = fullName.split(' ');
        const prenom = nameParts[0] || 'Prénom';
        const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Nom';
        
        clientProfile = new ClientProfile({
          userId: quote.clientId,
          tattooArtistId: quote.tattooArtistId._id,
          nom: nom,
          prenom: prenom,
          email: quote.clientInfo?.email || 'client@example.com',
          phone: quote.clientInfo?.phone || '',
          notes: `Fiche créée automatiquement depuis le devis accepté #${quote._id}`,
          projets: [project._id],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Ajouter le projet à la liste des projets du client
        if (!clientProfile.projets || !clientProfile.projets.includes(project._id)) {
          clientProfile.projets = clientProfile.projets || [];
          clientProfile.projets.push(project._id);
          clientProfile.updatedAt = new Date();
        }
      }

      await clientProfile.save();
      console.log('Client profile updated:', clientProfile._id);

    } catch (projectError) {
      console.error('Error creating project or client profile:', projectError);
      // Le devis reste accepté même si la création du projet échoue
    }

    res.json({
      success: true,
      message: 'Devis accepté avec succès',
      quote: quote,
      project: project,
      clientProfile: clientProfile
    });

  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation du devis',
      error: error.message
    });
  }
};

// Rejeter un devis
exports.rejectQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log('Rejecting quote:', id, 'Reason:', reason);

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Mettre à jour le statut
    quote.status = 'declined';
    quote.declinedAt = new Date();
    quote.declineReason = reason || 'Aucune raison spécifiée';
    quote.updatedAt = new Date();
    await quote.save();

    console.log('Quote declined successfully:', id);

    res.json({
      success: true,
      message: 'Devis refusé',
      quote: quote
    });

  } catch (error) {
    console.error('Error rejecting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet du devis',
      error: error.message
    });
  }
};

// Voir le PDF du devis
exports.viewQuotePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Viewing quote PDF:', id);

    const quote = await Quote.findById(id).populate('tattooArtistId', 'name email');
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Générer le PDF (version simplifiée sans Puppeteer pour l'instant)
    const pdfContent = `
      <html>
        <head>
          <title>Devis #${quote._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DEVIS</h1>
            <p>N° ${quote._id}</p>
          </div>
          
          <div class="section">
            <h3>Artiste</h3>
            <p>${quote.tattooArtistId?.name || 'Artiste'}</p>
            <p>${quote.tattooArtistId?.email || ''}</p>
          </div>
          
          <div class="section">
            <h3>Client</h3>
            <p>${quote.clientInfo?.name || 'Client'}</p>
            <p>${quote.clientInfo?.email || ''}</p>
          </div>
          
          <div class="section">
            <h3>Services</h3>
            ${quote.items && quote.items.length > 0 ? quote.items.map(item => `
              <p>${item.description || item} - ${item.totalPrice || item.price || 0}€</p>
            `).join('') : '<p>Aucun service spécifié</p>'}
          </div>
          
          <div class="section total">
            <p>TOTAL: ${quote.totalAmount}€</p>
          </div>
          
          <div class="section">
            <h3>Notes</h3>
            <p>${quote.notes || 'Aucune note'}</p>
          </div>
          
          <div class="section">
            <p>Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
            <p>Statut: ${quote.status}</p>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(pdfContent);

  } catch (error) {
    console.error('Error viewing quote PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'affichage du PDF',
      error: error.message
    });
  }
};

// Télécharger le PDF du devis
exports.downloadQuotePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Downloading quote PDF:', id);

    const quote = await Quote.findById(id).populate('tattooArtistId', 'name email');
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Pour l'instant, rediriger vers la vue PDF
    res.redirect(`/api/quotes/${id}/view-pdf`);

  } catch (error) {
    console.error('Error downloading quote PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du PDF',
      error: error.message
    });
  }
};

// Action générique pour gérer les actions sur les devis (depuis le frontend)
exports.handleQuoteAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    console.log('Handling quote action:', { id, action, reason });

    switch (action) {
      case 'send':
        return exports.sendQuote(req, res);
      case 'accept':
        return exports.acceptQuote(req, res);
      case 'reject':
        req.body = { reason };
        return exports.rejectQuote(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: 'Action non reconnue'
        });
    }
  } catch (error) {
    console.error('Error handling quote action:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de l\'action',
      error: error.message
    });
  }
};

// Récupérer tous les devis (pour le dashboard)
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({
      $or: [
        { tattooArtistId: req.user.id },
        { clientId: req.user.id }
      ]
    })
    .populate('tattooArtistId', 'name email')
    .populate('clientId', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      quotes: quotes,
      total: quotes.length
    });

  } catch (error) {
    console.error('Error getting quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis',
      error: error.message
    });
  }
};

// Récupérer un devis spécifique
exports.getQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id)
      .populate('tattooArtistId', 'name email')
      .populate('clientId', 'name email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Devis non trouvé'
      });
    }

    // Vérifier les permissions
    if (quote.tattooArtistId._id.toString() !== req.user.id && 
        quote.clientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.json({
      success: true,
      quote: quote
    });

  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du devis',
      error: error.message
    });
  }
};

// Obtenir les revenus mensuels
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ 
        message: 'Les paramètres month et year sont requis' 
      });
    }

    // Calculer le premier et dernier jour du mois
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Rechercher les devis acceptés du mois
    const acceptedQuotes = await Quote.find({
      tattooArtistId: tattooArtistId,
      status: 'accepted',
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculer le revenu total
    const totalRevenue = acceptedQuotes.reduce((sum, quote) => {
      return sum + (quote.totalAmount || 0);
    }, 0);

    res.json({
      revenue: totalRevenue,
      quotesCount: acceptedQuotes.length,
      period: `${month}/${year}`
    });

  } catch (error) {
    console.error('❌ REVENUE - Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
