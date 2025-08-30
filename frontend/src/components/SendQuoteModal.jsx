import React, { useState, useEffect } from 'react';
import { X, Send, FileText, User, Mail, Phone, Calendar, Euro } from 'lucide-react';

const SendQuoteModal = ({ 
  isOpen, 
  onClose, 
  quote, 
  onSend, 
  isLoading = false 
}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && quote) {
      loadPdfPreview();
    }
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [isOpen, quote]);

  const loadPdfPreview = async () => {
    setPdfLoading(true);
    setPdfUrl(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quote._id}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        console.error('Erreur lors du chargement du PDF');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(quote._id);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setSending(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Envoyer le devis au client</h2>
              <p className="text-gray-100 text-sm">
                Devis {quote.quoteNumber} • {quote.clientInfo?.name || 'Client'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={sending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)]">
          {/* Informations du devis - Sidebar */}
          <div className="lg:w-80 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Info devis */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Détails du devis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro :</span>
                    <span className="font-medium">{quote.quoteNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date :</span>
                    <span className="font-medium">{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant :</span>
                    <span className="font-bold text-gray-900">{(quote.totalAmount || 0).toFixed(2)} €</span>
                  </div>
                  {quote.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valide jusqu'au :</span>
                      <span className="font-medium">{formatDate(quote.validUntil)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info client */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Informations client
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {quote.clientInfo?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {quote.clientInfo?.name || 'Client inconnu'}
                      </div>
                      <div className="text-sm text-gray-500">Client</div>
                    </div>
                  </div>
                  
                  {quote.clientInfo?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{quote.clientInfo.email}</span>
                    </div>
                  )}
                  
                  {quote.clientInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{quote.clientInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items du devis */}
              {quote.items && quote.items.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4 text-green-600" />
                    Services ({quote.items.length})
                  </h3>
                  <div className="space-y-2">
                    {quote.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate flex-1 mr-2">
                          {item.description || 'Service'}
                        </span>
                        <span className="font-medium">
                          {((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                    {quote.items.length > 3 && (
                      <div className="text-xs text-gray-500 pt-1">
                        +{quote.items.length - 3} autre{quote.items.length - 3 > 1 ? 's' : ''} service{quote.items.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message d'information */}
              <div className="bg-back border border-back rounded-lg p-4">
                <h4 className="font-medium text-back mb-2">Que va recevoir le client ?</h4>
                <ul className="text-sm text-back space-y-1">
                  <li>• Un message dans la conversation</li>
                  <li>• Un lien pour télécharger le PDF</li>
                  <li>• La possibilité d'accepter/refuser</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Aperçu PDF */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900">Aperçu du PDF</h3>
              <p className="text-sm text-gray-600">
                Vérifiez le contenu avant l'envoi
              </p>
            </div>
            
            <div className="flex-1 bg-gray-100 relative overflow-hidden">
              {pdfLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du PDF...</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="Aperçu PDF du devis"
                  className="w-full h-full border-0"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Impossible de charger l'aperçu PDF</p>
                    <button 
                      onClick={loadPdfPreview}
                      className="mt-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Le client recevra un message avec le lien de téléchargement
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSend}
              disabled={sending || pdfLoading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmer l'envoi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;
