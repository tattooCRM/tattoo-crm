const Quote = require('../models/Quote');
const User = require('../models/User');
const { Conversation, Message } = require('../models/Chat');
const { generateQuotePDF } = require('../utils/pdfGenerator');
const { createProjectFromQuote } = require('./projectController');
const mongoose = require('mongoose');

// Créer un nouveau devis
exports.createQuote = async (req, res) => {
  try {
    
    const tattooArtistId = req.user.id;
    const { 
      conversationId, 
      clientId, 
      title,
      quoteNumber,
      items = [],
      clientInfo = {},
      artistInfo = {},
      notes,
      terms,
      validUntil,
      taxRate = 0,
      styling = {}
    } = req.body;

    // Vérifier que l'utilisateur est un tatoueur
    if (req.user.role !== 'tattoo_artist') {
      return res.status(403).json({ message: 'Seuls les tatoueurs peuvent créer des devis' });
    }

    // Vérifier que la conversation existe et que le tatoueur y participe
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.userId.toString() === tattooArtistId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }

    // Récupérer les informations du client et du tatoueur
    
    let client = await User.findById(clientId);
    const artist = await User.findById(tattooArtistId);


    // Si le client n'est pas trouvé directement, essayer de le récupérer via la conversation
    if (!client && conversation) {
      const clientParticipant = conversation.participants.find(p => p.role === 'client');
      if (clientParticipant) {
        client = await User.findById(clientParticipant.userId);
      }
    }

    if (!client || !artist) {
      return res.status(404).json({ message: 'Client ou tatoueur non trouvé' });
    }

    // Calculer les totaux
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice
    }));

    const subtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount;

    // Générer un numéro de devis unique si non fourni
    let finalQuoteNumber = quoteNumber;
    if (!finalQuoteNumber || finalQuoteNumber.trim() === '') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      finalQuoteNumber = `DEV-${year}${month}${day}-${time}`;
      
      // Vérifier l'unicité
      let counter = 1;
      let tempNumber = finalQuoteNumber;
      while (await Quote.findOne({ quoteNumber: tempNumber })) {
        tempNumber = `${finalQuoteNumber}-${counter}`;
        counter++;
      }
      finalQuoteNumber = tempNumber;
    }


    // Créer le devis
    const quote = new Quote({
      quoteNumber: finalQuoteNumber,
      tattooArtistId,
      clientId,
      conversationId,
      title: title || 'Devis Tatouage',
      clientInfo: {
        name: clientInfo.name || client.name || `${client.prenom || ''} ${client.nom || ''}`.trim(),
        email: clientInfo.email || client.email,
        phone: clientInfo.phone || client.phone || '',
        address: clientInfo.address || {}
      },
      artistInfo: {
        name: artistInfo.name || artist.name || `${artist.prenom || ''} ${artist.nom || ''}`.trim(),
        email: artistInfo.email || artist.email,
        phone: artistInfo.phone || artist.phone || '',
        address: artistInfo.address || {},
        siret: artistInfo.siret || artist.siret || '',
        tva: artistInfo.tva || artist.tva || ''
      },
      items: processedItems,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      notes: notes || '',
      terms: terms || undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      styling: {
        ...styling,
        primaryColor: styling.primaryColor || '#3182ce',
        secondaryColor: styling.secondaryColor || '#2d3748',
        fontFamily: styling.fontFamily || 'Arial, sans-serif'
      }
    });

    await quote.save();

    // Peupler les références pour la réponse
    await quote.populate(['tattooArtistId', 'clientId']);

    res.status(201).json({
      quote,
      message: 'Devis créé avec succès'
    });

  } catch (error) {
    console.error('Erreur création devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour un devis
exports.updateQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const tattooArtistId = req.user.id;
    const updateData = req.body;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le tatoueur est propriétaire du devis
    if (quote.tattooArtistId.toString() !== tattooArtistId) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    // Ne pas permettre la modification si le devis est accepté ou décliné
    if (quote.status === 'accepted' || quote.status === 'declined') {
      return res.status(400).json({ message: 'Ce devis ne peut plus être modifié' });
    }

    // Recalculer les totaux si les items ont changé
    if (updateData.items) {
      const processedItems = updateData.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }));

      const subtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = (subtotal * (updateData.taxRate || quote.taxRate)) / 100;
      const totalAmount = subtotal + taxAmount;

      updateData.items = processedItems;
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = totalAmount;
    }

    // Mettre à jour le devis
    Object.assign(quote, updateData);
    await quote.save();

    await quote.populate(['tattooArtistId', 'clientId']);

    res.json({
      quote,
      message: 'Devis mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Envoyer le devis au client
exports.sendQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const tattooArtistId = req.user.id;

    console.log('🔍 [DEBUG] sendQuote appelé:', { quoteId, tattooArtistId });

    const quote = await Quote.findById(quoteId).populate(['tattooArtistId', 'clientId']);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    if (quote.tattooArtistId._id.toString() !== tattooArtistId) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    // Marquer le devis comme envoyé
    quote.status = 'sent';
    quote.sentAt = new Date();
    await quote.save();
    
    console.log('✅ Devis marqué comme envoyé:', quote.quoteNumber);

    // TEMPORAIRE: Skip PDF generation pour éviter les erreurs
    // const pdfBuffer = await generateQuotePDF(quote);

    // Créer un message HTML stylé pour le devis
    const quoteMessageHTML = `
<div style="
  max-width: 400px;
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
  border-radius: 16px;
  padding: 0;
  margin: 16px 0;
  color: white;
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  border: 1px solid #333;
">
  <!-- Header du devis -->
  <div style="
    background: linear-gradient(135deg, #333 0%, #111 100%);
    padding: 20px;
    border-bottom: 1px solid #444;
  ">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 20px; margin-right: 8px;">📋</span>
      <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Devis Tatouage</h2>
    </div>
    <p style="margin: 0; font-size: 13px; opacity: 0.8;">N° ${quote.quoteNumber}</p>
  </div>

  <!-- Contenu du devis -->
  <div style="padding: 20px;">
    <!-- Titre du projet -->
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">${quote.title || 'Projet de tatouage'}</h3>
    
    <!-- Items du devis -->
    ${quote.items?.map(item => `
      <div style="margin-bottom: 8px; font-size: 13px; opacity: 0.9;">
        • ${item.description} ${item.quantity > 1 ? `(×${item.quantity})` : ''}
        <span style="float: right; font-weight: 500;">${item.totalPrice}€</span>
      </div>
    `).join('') || ''}
    
    <!-- Prix total -->
    <div style="
      background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
      margin: 16px -20px 20px;
      padding: 16px 20px;
      border-top: 1px solid #444;
      border-bottom: 1px solid #444;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 14px; opacity: 0.9;">Prix total</span>
        <span style="font-size: 20px; font-weight: 700;">${quote.totalAmount || quote.subtotal}€</span>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button onclick="handleQuoteAction('accept', '${quote._id}')" style="
        flex: 1;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
      ">✅ Accepter</button>
      <button onclick="handleQuoteAction('decline', '${quote._id}')" style="
        flex: 1;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
      ">❌ Refuser</button>
    </div>
    
    <div style="text-align: center;">
      <button onclick="handleQuoteAction('view_pdf', '${quote._id}')" style="
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 12px;
        cursor: pointer;
      ">📄 Voir le PDF</button>
    </div>
    
    <!-- Notes si présentes -->
    ${quote.notes ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #444;">
        <p style="margin: 0; font-size: 12px; opacity: 0.8; line-height: 1.4;">${quote.notes}</p>
      </div>
    ` : ''}
    
    <!-- Footer -->
    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #444; text-align: center;">
      <p style="margin: 0; font-size: 11px; opacity: 0.7;">
        Devis proposé par <strong>${quote.tattooArtistId?.firstName || quote.tattooArtistId?.nom || 'Artiste'} ${quote.tattooArtistId?.lastName || quote.tattooArtistId?.prenom || ''}</strong>
      </p>
    </div>
  </div>
</div>
`;
      <div style="
        background: linear-gradient(135deg, #444 0%, #222 100%);
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        border: 1px solid #555;
      ">
        <span style="font-size: 20px;">�</span>
      </div>
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #fff;">Devis ${quote.quoteNumber}</h3>
        <p style="margin: 2px 0 0 0; opacity: 0.8; font-size: 13px; color: #ccc;">${quote.title || 'Devis Tatouage'}</p>
      </div>
    </div>
  </div>

  <!-- Contenu principal -->
  <div style="padding: 20px;">
    <!-- Montant -->
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 12px; opacity: 0.7; margin-bottom: 4px; color: #aaa; font-weight: 600; text-transform: uppercase;">Montant Total</div>
      <div style="
        background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
        padding: 16px;
        border-radius: 12px;
        margin: 8px auto;
        max-width: 200px;
        border: 1px solid #9ca3af;
      ">
        <div style="font-size: 32px; font-weight: 700; margin-bottom: 4px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${quote.totalAmount.toFixed(2)} €</div>
      </div>
      <div style="font-size: 13px; opacity: 0.8; color: #ccc;">
        Valable jusqu'au ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'Non défini'}
      </div>
    </div>

    ${quote.items && quote.items.length > 0 ? `
    <!-- Détails -->
    <div style="
      background: linear-gradient(135deg, #222 0%, #111 100%);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #333;
    ">
      <div style="font-size: 12px; opacity: 0.7; margin-bottom: 12px; text-transform: uppercase; font-weight: 600; color: #aaa;">Détails</div>
      ${quote.items.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
          <span style="flex: 1; color: #ddd;">${item.description}</span>
          <span style="margin-left: 8px; font-weight: 600; color: #fff;">${item.totalPrice}€</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${quote.notes ? `
    <!-- Notes -->
    <div style="
      background: linear-gradient(135deg, #222 0%, #111 100%);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #333;
    ">
      <div style="font-size: 12px; opacity: 0.7; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; color: #aaa;">Notes</div>
      <div style="font-size: 14px; line-height: 1.4; color: #ddd;">${quote.notes}</div>
    </div>
    ` : ''}

    <!-- Boutons d'action -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
      <button onclick="handleQuoteAction('accept', '${quote._id}')" style="
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        border: 1px solid #16a34a;
        color: white;
        padding: 12px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'">
        <span>✅</span>
        <span>Accepter</span>
      </button>
      
      <button onclick="handleQuoteAction('decline', '${quote._id}')" style="
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid #dc2626;
        color: white;
        padding: 12px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'">
        <span>❌</span>
        <span>Refuser</span>
      </button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
      <button onclick="window.open('http://localhost:5000/api/quotes/${quote._id}/view', '_blank')" style="
        background: linear-gradient(135deg, #333 0%, #222 100%);
        border: 1px solid #444;
        color: #ddd;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      " onmouseover="this.style.background='linear-gradient(135deg, #444 0%, #333 100%)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='linear-gradient(135deg, #333 0%, #222 100%)'; this.style.transform='translateY(0)'">
        <span>👁️</span>
        <span>Voir détail</span>
      </button>
      
      <button onclick="window.open('http://localhost:5000/api/quotes/${quote._id}/pdf', '_blank')" style="
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: 1px solid #3b82f6;
        color: white;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      " onmouseover="this.style.background='linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; this.style.transform='translateY(0)'">
        <span>📄</span>
        <span>Voir PDF</span>
      </button>
    </div>
  </div>
  </div>

  <!-- Footer -->
  <div style="
    background: linear-gradient(135deg, #111 0%, #000 100%);
    padding: 12px 20px;
    text-align: center;
    font-size: 12px;
    opacity: 0.8;
    border-top: 1px solid #333;
    color: #888;
  ">
    <div style="margin-bottom: 4px;">Répondez en message pour poser des questions</div>
    <div style="color: #aaa;">Devis proposé par <strong style="color: #fff;">${artist.nom || 'Artiste'} ${artist.prenom || ''}</strong></div>
  </div>
</div>

<script>
function handleQuoteAction(action, quoteId) {
  // Cette fonction sera gérée par le frontend
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage({
      type: 'quote_action',
      action: action,
      quoteId: quoteId
    }, '*');
  }
}
</script>`;
    const quoteMessage = {
      text: `📋 **Nouveau Devis ${quote.quoteNumber}**

💰 **Montant total : ${quote.totalAmount.toFixed(2)} €**
📅 Valable jusqu'au : ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'Non défini'}

${quote.items && quote.items.length > 0 ? 
  '📝 **Détails :**\n' + quote.items.map(item => 
    `• ${item.description} - ${item.quantity}x ${item.unitPrice}€ = ${item.totalPrice}€`
  ).join('\n') : ''}

${quote.notes ? `\n💬 **Notes :** ${quote.notes}` : ''}`,
      
      buttons: [
        {
          id: 'accept_quote',
          text: '✅ Accepter le devis',
          style: 'primary',
          action: 'accept_quote',
          data: { quoteId: quote._id.toString() }
        },
        {
          id: 'decline_quote', 
          text: '❌ Refuser le devis',
          style: 'secondary',
          action: 'decline_quote',
          data: { quoteId: quote._id.toString() }
        },
        {
          id: 'view_quote',
          text: '�️ Voir le détail',
          style: 'outline',
          action: 'view_quote',
          data: { 
            quoteId: quote._id.toString(),
            url: `http://localhost:5000/api/quotes/${quote._id}/view`
          }
        },
        {
          id: 'download_pdf',
          text: '📄 Télécharger PDF',
          style: 'outline', 
          action: 'download_pdf',
          data: {
            quoteId: quote._id.toString(),
            url: `http://localhost:5000/api/quotes/${quote._id}/pdf`,
            filename: `devis_${quote.quoteNumber}.pdf`
          }
        }
      ]
    };

    // Trouver la conversation entre l'artiste et le client
    console.log('🔍 Recherche conversation entre:', {
      artistId: tattooArtistId,
      clientId: quote.clientId._id
    });
    
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': tattooArtistId },
        { 'participants.userId': quote.clientId._id }
      ]
    });
    
    if (!conversation) {
      console.log('❌ Aucune conversation trouvée entre l\'artiste et le client');
      return res.status(400).json({ 
        message: 'Aucune conversation trouvée entre vous et ce client. Veuillez d\'abord démarrer une conversation.' 
      });
    }
    
    console.log('✅ Conversation trouvée:', conversation._id);

    const message = new Message({
      conversationId: conversation._id, // Utiliser la conversation trouvée
      senderId: tattooArtistId,
      content: quoteMessageHTML, // Utiliser le HTML stylé
      type: 'quote', // Type spécifique pour les devis
      metadata: {
        quoteId: quote._id,
        quoteNumber: quote.quoteNumber,
        totalAmount: quote.totalAmount,
        messageType: 'html_quote' // Marquer comme message HTML
      }
    });

    console.log('🔍 [DEBUG] Message à créer:', {
      conversationId: conversation._id,
      senderId: tattooArtistId,
      type: 'quote',
      contentLength: quoteMessageHTML.length,
      messageType: 'html_quote',
      htmlPreview: quoteMessageHTML.substring(0, 100)
    });

    await message.save();
    console.log('✅ Message de devis sauvegardé:', message._id);

    // Mettre à jour la conversation trouvée
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();
    
    console.log('✅ Conversation mise à jour:', conversation._id);

    res.json({
      quote,
      message: 'Devis envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur envoi devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer tous les devis d'un tatoueur
exports.getQuotes = async (req, res) => {
  try {
    const tattooArtistId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tattooArtistId };
    if (status) {
      filter.status = status;
    }

    const quotes = await Quote.find(filter)
      .populate('clientId', 'name prenom nom email')
      .populate('tattooArtistId', 'name prenom nom email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quote.countDocuments(filter);

    res.json({
      quotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un devis par son ID
exports.getQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user.id;

    const quote = await Quote.findById(quoteId)
      .populate('clientId', 'name prenom nom email')
      .populate('tattooArtistId', 'name prenom nom email');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que l'utilisateur est soit le tatoueur soit le client
    if (quote.tattooArtistId._id.toString() !== userId && quote.clientId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    res.json({ quote });

  } catch (error) {
    console.error('Erreur récupération devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Accepter ou décliner un devis (côté client)
exports.respondToQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { response } = req.body; // 'accepted' ou 'declined'
    const clientId = req.user.id;

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({ message: 'Réponse invalide' });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    if (quote.clientId.toString() !== clientId) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    if (quote.status !== 'sent') {
      return res.status(400).json({ message: 'Ce devis ne peut plus être modifié' });
    }

    // Vérifier si le devis n'est pas expiré
    if (new Date() > quote.validUntil) {
      quote.status = 'expired';
      await quote.save();
      return res.status(400).json({ message: 'Ce devis a expiré' });
    }

    quote.status = response;
    quote.respondedAt = new Date();
    await quote.save();

    // Envoyer une notification dans la conversation
    const responseMessage = response === 'accepted' 
      ? '✅ **Devis accepté !** Le client a accepté votre devis. Vous pouvez maintenant planifier la séance.'
      : '❌ **Devis décliné.** Le client a décliné votre devis.';

    const message = new Message({
      conversationId: quote.conversationId,
      senderId: clientId,
      content: responseMessage,
      type: 'system'
    });

    await message.save();

    // Mettre à jour la conversation
    const conversation = await Conversation.findById(quote.conversationId);
    if (conversation) {
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    res.json({
      quote,
      message: `Devis ${response === 'accepted' ? 'accepté' : 'décliné'} avec succès`
    });

  } catch (error) {
    console.error('Erreur réponse devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Accepter un devis (côté client)
exports.acceptQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const clientId = req.user.id;
    const clientRole = req.user.role;

    // Vérifier que l'utilisateur est un client
    if (clientRole !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent accepter un devis' });
    }

    const quote = await Quote.findById(quoteId).populate(['tattooArtistId', 'clientId']);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le client est bien le destinataire du devis
    if (quote.clientId._id.toString() !== clientId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accepter ce devis' });
    }

    // Vérifier que le devis peut encore être accepté
    if (quote.status !== 'sent') {
      return res.status(400).json({ message: 'Ce devis ne peut plus être accepté' });
    }

    // Vérifier que le devis n'a pas expiré
    if (new Date() > new Date(quote.validUntil)) {
      return res.status(400).json({ message: 'Ce devis a expiré' });
    }

    // Marquer le devis comme accepté
    quote.status = 'accepted';
    quote.acceptedAt = new Date();
    await quote.save();

    // Envoyer un message de confirmation dans la conversation
    const { Conversation, Message } = require('../models/Chat');
    
    const confirmationMessage = new Message({
      conversationId: quote.conversationId,
      senderId: clientId,
      content: `✅ J'ai accepté le devis ${quote.quoteNumber} d'un montant de ${quote.totalAmount.toFixed(2)} €`,
      type: 'system'
    });

    await confirmationMessage.save();

    // Mettre à jour la conversation
    const conversation = await Conversation.findById(quote.conversationId);
    if (conversation) {
      conversation.lastMessage = confirmationMessage._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    res.json({
      message: 'Devis accepté avec succès',
      quote: {
        id: quote._id,
        status: quote.status,
        acceptedAt: quote.acceptedAt
      }
    });

  } catch (error) {
    console.error('Erreur acceptation devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Refuser un devis (côté client)
exports.rejectQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const clientId = req.user.id;
    const clientRole = req.user.role;
    const { reason } = req.body; // Raison optionnelle du refus

    // Vérifier que l'utilisateur est un client
    if (clientRole !== 'client') {
      return res.status(403).json({ message: 'Seuls les clients peuvent refuser un devis' });
    }

    const quote = await Quote.findById(quoteId).populate(['tattooArtistId', 'clientId']);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que le client est bien le destinataire du devis
    if (quote.clientId._id.toString() !== clientId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à refuser ce devis' });
    }

    // Vérifier que le devis peut encore être refusé
    if (quote.status !== 'sent') {
      return res.status(400).json({ message: 'Ce devis ne peut plus être refusé' });
    }

    // Marquer le devis comme refusé
    quote.status = 'rejected';
    quote.rejectedAt = new Date();
    if (reason) {
      quote.rejectionReason = reason;
    }
    await quote.save();

    // Envoyer un message de refus dans la conversation
    const { Conversation, Message } = require('../models/Chat');
    
    const rejectionMessage = new Message({
      conversationId: quote.conversationId,
      senderId: clientId,
      content: `❌ J'ai refusé le devis ${quote.quoteNumber}${reason ? `. Raison: ${reason}` : ''}`,
      type: 'system'
    });

    await rejectionMessage.save();

    // Mettre à jour la conversation
    const conversation = await Conversation.findById(quote.conversationId);
    if (conversation) {
      conversation.lastMessage = rejectionMessage._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    }

    res.json({
      message: 'Devis refusé',
      quote: {
        id: quote._id,
        status: quote.status,
        rejectedAt: quote.rejectedAt
      }
    });

  } catch (error) {
    console.error('Erreur refus devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un devis (seulement si draft)
exports.deleteQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const tattooArtistId = req.user.id;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    if (quote.tattooArtistId.toString() !== tattooArtistId) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    if (quote.status !== 'draft') {
      return res.status(400).json({ message: 'Seuls les brouillons peuvent être supprimés' });
    }

    await Quote.findByIdAndDelete(quoteId);

    res.json({ message: 'Devis supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Télécharger le devis en PDF
exports.downloadQuotePDF = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user?.id;

    console.log('📄 PDF DOWNLOAD - Début pour devis:', quoteId);
    
    const quote = await Quote.findById(quoteId).populate(['tattooArtistId', 'clientId']);
    if (!quote) {
      console.log('❌ PDF DOWNLOAD - Devis non trouvé:', quoteId);
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    console.log('✅ PDF DOWNLOAD - Devis trouvé:', quote.quoteNumber);

    // Vérifier que l'utilisateur a accès au devis (tatoueur qui l'a créé ou client concerné)
    const isOwner = userId && quote.tattooArtistId._id.toString() === userId;
    const isClient = userId && quote.clientId && quote.clientId._id.toString() === userId;
    const isPublicAccess = !userId; // Accès public autorisé

    console.log('🔐 PDF DOWNLOAD - Vérification accès:', { isOwner, isClient, isPublicAccess });

    // Pour le téléchargement, on permet aussi l'accès public
    if (userId && !isOwner && !isClient) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    // Générer le PDF
    console.log('🔄 PDF DOWNLOAD - Génération PDF...');
    const pdfBuffer = await generateQuotePDF(quote);

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error('❌ PDF DOWNLOAD - Buffer PDF invalide');
      return res.status(500).json({ message: 'Erreur génération PDF' });
    }

    console.log('✅ PDF DOWNLOAD - PDF généré avec succès, envoi au client');

    // Définir les headers pour le téléchargement
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Devis-${quote.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pdfBuffer);
    console.log('✅ PDF DOWNLOAD - Envoi terminé avec succès');
  } catch (error) {
    console.error('❌ PDF DOWNLOAD - Erreur:', error);
    
    // Si l'erreur est liée à Puppeteer/PDF, retourner un message d'erreur approprié
    if (error.message.includes('Puppeteer') || error.message.includes('PDF')) {
      return res.status(503).json({ 
        message: 'Service PDF temporairement indisponible', 
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Visualiser le PDF dans le navigateur
exports.viewQuotePDF = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.user?.id;


    const quote = await Quote.findById(quoteId)
      .populate('tattooArtistId', 'name email phone address')
      .populate('clientId', 'name email phone');

    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }


    // Vérifier les autorisations (plus permissif pour la visualisation)
    const isOwner = userId && quote.tattooArtistId._id.toString() === userId;
    const isClient = userId && quote.clientId && quote.clientId._id.toString() === userId;
    const isPublicAccess = !userId; // Accès public autorisé


    // Pour la visualisation, on permet l'accès public
    if (userId && !isOwner && !isClient) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    // Générer le PDF
    const pdfBuffer = await generateQuotePDF(quote);

    // Définir les headers pour l'affichage dans le navigateur
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Devis-${quote.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ PDF VIEW - Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
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

// Gérer les actions des boutons de devis (accepter, refuser, voir, télécharger)
exports.handleQuoteAction = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { action, conversationId } = req.body;
    const userId = req.user.id;

    console.log('🎯 Action de devis reçue:', { action, quoteId, userId });

    const quote = await Quote.findById(quoteId).populate(['tattooArtistId', 'clientId']);
    if (!quote) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    // Vérifier que l'utilisateur a le droit d'effectuer cette action
    const isClient = quote.clientId._id.toString() === userId;
    const isTattooArtist = quote.tattooArtistId._id.toString() === userId;
    
    if (!isClient && !isTattooArtist) {
      return res.status(403).json({ message: 'Accès non autorisé à ce devis' });
    }

    let responseMessage = '';
    let updatedQuote = quote;

    switch (action) {
      case 'accept_quote':
        if (!isClient) {
          return res.status(403).json({ message: 'Seul le client peut accepter le devis' });
        }
        if (quote.status !== 'sent') {
          return res.status(400).json({ message: 'Ce devis ne peut pas être accepté' });
        }
        
        updatedQuote.status = 'accepted';
        updatedQuote.respondedAt = new Date();
        await updatedQuote.save();
        
        // Créer automatiquement un projet
        try {
          const project = await createProjectFromQuote(quote._id);
          console.log('✅ Projet créé automatiquement:', project.projectNumber);
          responseMessage = `✅ **Devis ${quote.quoteNumber} accepté !**\n\n🎉 Votre projet **${project.projectNumber}** a été créé avec succès !\n\nJe vais maintenant finaliser le design avec vous. Merci pour votre confiance !`;
        } catch (error) {
          console.error('❌ Erreur lors de la création du projet:', error);
          responseMessage = `✅ **Devis ${quote.quoteNumber} accepté !**\n\nMerci pour votre confiance ! Nous allons prendre contact avec vous pour organiser la suite.`;
        }
        break;

      case 'decline_quote':
        if (!isClient) {
          return res.status(403).json({ message: 'Seul le client peut refuser le devis' });
        }
        if (quote.status !== 'sent') {
          return res.status(400).json({ message: 'Ce devis ne peut pas être refusé' });
        }
        
        updatedQuote.status = 'declined';
        updatedQuote.declinedAt = new Date();
        await updatedQuote.save();
        
        responseMessage = `❌ **Devis ${quote.quoteNumber} refusé**\n\nPas de problème ! N'hésitez pas à nous faire savoir si vous souhaitez modifier quelque chose.`;
        break;

      case 'view_quote':
        responseMessage = `👁️ **Consultation du devis ${quote.quoteNumber}**\n\nVous consultez les détails du devis.`;
        break;

      case 'download_pdf':
        responseMessage = `📄 **Téléchargement du devis ${quote.quoteNumber}**\n\nLe PDF du devis a été téléchargé.`;
        break;

      default:
        return res.status(400).json({ message: 'Action non reconnue' });
    }

    // Si il y a un message de réponse et une conversation, créer un message système
    if (responseMessage && conversationId && (action === 'accept_quote' || action === 'decline_quote')) {
      const systemMessage = new Message({
        conversationId: conversationId,
        senderId: userId,
        content: responseMessage,
        type: 'system',
        metadata: {
          quoteId: quote._id,
          action: action,
          timestamp: new Date()
        }
      });
      
      await systemMessage.save();
      
      // Mettre à jour la conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMessage._id,
        lastActivity: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Action effectuée avec succès',
      quote: updatedQuote,
      action: action,
      responseMessage: responseMessage
    });

  } catch (error) {
    console.error('❌ Erreur action devis:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  createQuote: exports.createQuote,
  updateQuote: exports.updateQuote,
  sendQuote: exports.sendQuote,
  getQuotes: exports.getQuotes,
  getQuote: exports.getQuote,
  respondToQuote: exports.respondToQuote,
  deleteQuote: exports.deleteQuote,
  downloadQuotePDF: exports.downloadQuotePDF,
  viewQuotePDF: exports.viewQuotePDF,
  getMonthlyRevenue: exports.getMonthlyRevenue,
  acceptQuote: exports.acceptQuote,
  rejectQuote: exports.rejectQuote,
  handleQuoteAction: exports.handleQuoteAction
};
