import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Send, Save, Eye, Palette, FileText } from 'lucide-react';

const QuoteEditor = ({ 
  conversationId, 
  clientId, 
  clientName = '', 
  onClose, 
  onSave,
  initialQuote = null 
}) => {
  const [quote, setQuote] = useState({
    title: 'Devis Tatouage',
    quoteNumber: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    clientInfo: {
      name: clientName,
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
        country: 'France'
      }
    },
    artistInfo: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
        country: 'France'
      },
      siret: '',
      tva: ''
    },
    items: [
      {
        description: 'Tatouage personnalisé',
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150
      }
    ],
    subtotal: 150,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 150,
    notes: '',
    terms: 'Ce devis est valable 30 jours à compter de sa date d\'émission. Un acompte de 30% sera demandé à la validation du devis.',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    styling: {
      primaryColor: '#3182ce',
      secondaryColor: '#2d3748',
      fontFamily: 'Arial, sans-serif',
      logo: '',
      headerText: '',
      footerText: ''
    }
  });

  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);

  // Initialiser avec les données existantes si modification
  useEffect(() => {
    if (initialQuote) {
      setQuote({
        ...initialQuote,
        validUntil: new Date(initialQuote.validUntil).toISOString().split('T')[0]
      });
    }
  }, [initialQuote]);

  // Calculer les totaux automatiquement
  useEffect(() => {
    const subtotal = quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * quote.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    setQuote(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  }, [quote.items.map(item => `${item.quantity}-${item.unitPrice}`).join(','), quote.taxRate]);

  const addItem = () => {
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      }]
    }));
  };

  const updateItem = (index, field, value) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: parseFloat(value) || value } : item
      )
    }));
  };

  const removeItem = (index) => {
    if (quote.items.length > 1) {
      setQuote(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = async () => {
    // Validation frontend : nom et email client obligatoires
    if (!quote.clientInfo?.name || !quote.clientInfo?.email) {
      alert('Veuillez renseigner le nom et l\'email du client.');
      return;
    }
    setIsLoading(true);
    try {
      // Construction du payload minimal attendu par le backend
      const quoteData = {
        clientName: quote.clientInfo.name,
        clientEmail: quote.clientInfo.email,
        clientPhone: quote.clientInfo.phone,
        services: quote.items.map(item => ({
          name: item.description,
          description: item.description,
          price: item.unitPrice,
          quantity: item.quantity
        })),
        notes: quote.notes,
        validUntil: quote.validUntil,
        // Optionnel : tu peux ajouter d'autres champs si le backend les attend
      };
      if (conversationId) quoteData.conversationId = conversationId;
      if (clientId) quoteData.clientId = clientId;

      const token = localStorage.getItem('token');
      const url = initialQuote 
        ? `/api/quotes/${initialQuote._id}`
        : '/api/quotes';
      const method = initialQuote ? 'PUT' : 'POST';
      const fullUrl = `http://localhost:5000${url}`;

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quoteData)
      });

      if (response.ok) {
        const data = await response.json();
        onSave?.(data.quote);
        if (!initialQuote) {
          alert('Devis créé avec succès !');
        } else {
          alert('Devis mis à jour avec succès !');
        }
      } else {
        const errorText = await response.text();
        console.error('🔍 Debug - Error response:', errorText);
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du devis');
    }
    setIsLoading(false);
  };

  const handleSendQuote = async () => {
    if (!initialQuote) {
      alert('Veuillez d\'abord sauvegarder le devis');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${initialQuote._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Devis envoyé au client avec succès !');
        onClose();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du devis');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
        
        {/* Panel gauche - Éditeur */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-black text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {initialQuote ? 'Modifier le devis' : 'Créer un devis'}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'content' 
                    ? 'bg-white bg-opacity-20' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Contenu
              </button>
              <button
                onClick={() => setActiveTab('styling')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'styling' 
                    ? 'bg-white bg-opacity-20' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Style
              </button>
            </div>
          </div>

          {/* Contenu de l'éditeur */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informations générales</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre du devis</label>
                        <input
                          type="text"
                          value={quote.title}
                          onChange={(e) => setQuote(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Numéro de devis</label>
                        <input
                          type="text"
                          value={quote.quoteNumber}
                          onChange={(e) => setQuote(prev => ({ ...prev, quoteNumber: e.target.value }))}
                          placeholder="DEV-2025-001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Valable jusqu'au</label>
                        <input
                          type="date"
                          value={quote.validUntil}
                          onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Taux TVA (%)</label>
                        <input
                          type="number"
                          value={quote.taxRate}
                          onChange={(e) => setQuote(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations client */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informations client</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        value={quote.clientInfo.name}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          clientInfo: { ...prev.clientInfo, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={quote.clientInfo.email}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          clientInfo: { ...prev.clientInfo, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={quote.clientInfo.phone}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          clientInfo: { ...prev.clientInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ville</label>
                      <input
                        type="text"
                        value={quote.clientInfo.address.city}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          clientInfo: {
                            ...prev.clientInfo,
                            address: { ...prev.clientInfo.address, city: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Articles/Services */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Articles / Services</h3>
                    <button
                      onClick={addItem}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {quote.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Article {index + 1}</h4>
                          {quote.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Quantité</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Prix unitaire (€)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Total (€)</label>
                            <input
                              type="text"
                              value={`${item.totalPrice.toFixed(2)} €`}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes et conditions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes et conditions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        rows="3"
                        value={quote.notes}
                        onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notes supplémentaires pour le client..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Conditions générales</label>
                      <textarea
                        rows="4"
                        value={quote.terms}
                        onChange={(e) => setQuote(prev => ({ ...prev, terms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'styling' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personnalisation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Couleur principale</label>
                      <input
                        type="color"
                        value={quote.styling.primaryColor}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Couleur secondaire</label>
                      <input
                        type="color"
                        value={quote.styling.secondaryColor}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          styling: { ...prev.styling, secondaryColor: e.target.value }
                        }))}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Police</label>
                    <select
                      value={quote.styling.fontFamily}
                      onChange={(e) => setQuote(prev => ({
                        ...prev,
                        styling: { ...prev.styling, fontFamily: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Texte d'en-tête personnalisé</label>
                    <input
                      type="text"
                      value={quote.styling.headerText}
                      onChange={(e) => setQuote(prev => ({
                        ...prev,
                        styling: { ...prev.styling, headerText: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Studio Ink - Tatouage Artistique"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Pied de page</label>
                    <textarea
                      rows="2"
                      value={quote.styling.footerText}
                      onChange={(e) => setQuote(prev => ({
                        ...prev,
                        styling: { ...prev.styling, footerText: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Merci de votre confiance..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total: <span className="text-2xl font-bold text-blue-600">{quote.totalAmount.toFixed(2)} €</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                {initialQuote && (
                  <button
                    onClick={handleSendQuote}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Envoi...' : 'Envoyer au client'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel droit - Prévisualisation */}
        <div className="w-1/2 bg-gray-100 border-l">
          <div className="p-6 border-b bg-white">
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-semibold">Aperçu du devis</h3>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto h-full">
            <div 
              className="bg-white rounded-lg shadow-lg p-8 max-w-2xl"
              style={{ 
                fontFamily: quote.styling.fontFamily,
                color: quote.styling.secondaryColor 
              }}
            >
              {/* En-tête */}
              <div className="border-b-2 pb-6 mb-6" style={{ borderColor: quote.styling.primaryColor }}>
                {quote.styling.headerText && (
                  <h1 className="text-2xl font-bold mb-2" style={{ color: quote.styling.primaryColor }}>
                    {quote.styling.headerText}
                  </h1>
                )}
                <h2 className="text-xl font-semibold mb-4">{quote.title}</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-sm uppercase mb-2" style={{ color: quote.styling.primaryColor }}>
                      Facturé à:
                    </h3>
                    <div className="text-sm">
                      <div className="font-medium">{quote.clientInfo.name}</div>
                      <div>{quote.clientInfo.email}</div>
                      {quote.clientInfo.phone && <div>{quote.clientInfo.phone}</div>}
                      {quote.clientInfo.address.city && <div>{quote.clientInfo.address.city}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-4">
                      <div><strong>N° Devis:</strong> {quote.quoteNumber || 'DEV-XXXX-XXX'}</div>
                      <div><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</div>
                      <div><strong>Valable jusqu'au:</strong> {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: `${quote.styling.primaryColor}20` }}>
                      <th className="text-left py-2 px-3 text-sm font-semibold">Description</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold">Qté</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold">Prix unit.</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-3 text-sm">{item.description}</td>
                        <td className="py-3 px-3 text-sm text-right">{item.quantity}</td>
                        <td className="py-3 px-3 text-sm text-right">{item.unitPrice.toFixed(2)} €</td>
                        <td className="py-3 px-3 text-sm text-right font-medium">{item.totalPrice.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Sous-total:</span>
                      <span>{quote.subtotal.toFixed(2)} €</span>
                    </div>
                    {quote.taxRate > 0 && (
                      <div className="flex justify-between py-2">
                        <span>TVA ({quote.taxRate}%):</span>
                        <span>{quote.taxAmount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div 
                      className="flex justify-between py-3 border-t font-bold text-lg"
                      style={{ borderColor: quote.styling.primaryColor, color: quote.styling.primaryColor }}
                    >
                      <span>TOTAL:</span>
                      <span>{quote.totalAmount.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quote.notes && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${quote.styling.primaryColor}10` }}>
                  <h4 className="font-semibold mb-2" style={{ color: quote.styling.primaryColor }}>Notes:</h4>
                  <p className="text-sm whitespace-pre-line">{quote.notes}</p>
                </div>
              )}

              {/* Conditions */}
              <div className="mt-6 pt-4 border-t text-xs text-gray-600">
                <h4 className="font-semibold mb-2">Conditions générales:</h4>
                <p className="whitespace-pre-line">{quote.terms}</p>
              </div>

              {/* Pied de page */}
              {quote.styling.footerText && (
                <div className="mt-6 pt-4 border-t text-center text-sm" style={{ color: quote.styling.primaryColor }}>
                  {quote.styling.footerText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteEditor;
