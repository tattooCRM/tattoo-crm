import React, { useState } from 'react';
import { Eye, Download, Check, X, ExternalLink } from 'lucide-react';

const QuoteMessage = ({ message, isOwn, currentUserId, onButtonClick }) => {
  const [loading, setLoading] = useState(null);
  
  // Extraire les données du devis depuis les metadata
  const quoteData = message.metadata || {};
  const buttons = quoteData.buttons || [];
  const isClient = message.senderId !== currentUserId; // Si ce n'est pas notre message, on est le client
  
  // Parser le contenu du message pour extraire les informations
  const content = message.content || '';
  const lines = content.split('\n');
  const titleLine = lines.find(line => line.includes('Nouveau Devis')) || '';
  const amountLine = lines.find(line => line.includes('Montant')) || '';
  const validUntilLine = lines.find(line => line.includes('Valable jusqu\'au')) || '';
  
  // Extraire le numéro de devis
  const quoteNumber = titleLine.match(/Devis (.+?)\*\*/) ? titleLine.match(/Devis (.+?)\*\*/)[1] : 'N/A';
  
  // Extraire le montant
  const amount = amountLine.match(/(\d+(?:\.\d{2})?) €/) ? amountLine.match(/(\d+(?:\.\d{2})?) €/)[1] : '0';
  
  // Extraire la date de validité
  const validUntil = validUntilLine.match(/: (.+)$/) ? validUntilLine.match(/: (.+)$/)[1] : 'Non défini';
  
  const handleButtonClick = async (button) => {
    setLoading(button.id);
    
    try {
      if (onButtonClick) {
        await onButtonClick(button, quoteData.quoteId);
      }
      
      // Actions spécifiques selon le type de bouton
      switch (button.action) {
        case 'view_quote':
          if (button.data?.url) {
            window.open(button.data.url, '_blank');
          }
          break;
          
        case 'download_pdf':
          if (button.data?.url) {
            const link = document.createElement('a');
            link.href = button.data.url;
            link.download = button.data.filename || `devis_${quoteNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;
          
        default:
          // Les actions accept_quote et decline_quote sont gérées par onButtonClick
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setLoading(null);
    }
  };
  
  const getButtonIcon = (action) => {
    switch (action) {
      case 'accept_quote':
        return <Check size={16} />;
      case 'decline_quote':
        return <X size={16} />;
      case 'view_quote':
        return <Eye size={16} />;
      case 'download_pdf':
        return <Download size={16} />;
      default:
        return <ExternalLink size={16} />;
    }
  };
  
  const getButtonStyle = (style, action) => {
    const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors";
    
    switch (style) {
      case 'primary':
        return `${baseStyle} bg-green-600 hover:bg-green-700 text-white`;
      case 'secondary':
        return `${baseStyle} bg-red-600 hover:bg-red-700 text-white`;
      case 'outline':
        return `${baseStyle} border border-gray-300 hover:bg-gray-50 text-gray-700`;
      default:
        return `${baseStyle} bg-gray-200 hover:bg-gray-300 text-gray-700`;
    }
  };
  
  return (
    <div className={`max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
        isOwn ? 'border-l-4 border-l-blue-500' : ''
      }`}>
        {/* En-tête du devis */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">📋</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Devis {quoteNumber}</h3>
              <p className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Contenu du devis */}
        <div className="px-4 py-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Montant total :</span>
              <span className="font-bold text-lg text-green-600">{amount} €</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valable jusqu'au :</span>
              <span className="text-sm font-medium">{validUntil}</span>
            </div>
          </div>
          
          {/* Détails du devis (si disponible dans le message) */}
          {content.includes('Détails :') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Détails :</p>
              <div className="text-xs text-gray-700 whitespace-pre-line">
                {content.split('**Détails :**')[1]?.split('\n\n')[0]?.trim()}
              </div>
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        {buttons.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-2 gap-2">
              {buttons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button)}
                  disabled={loading === button.id}
                  className={`${getButtonStyle(button.style, button.action)} ${
                    loading === button.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading === button.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    getButtonIcon(button.action)
                  )}
                  <span className="truncate">{button.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Status du devis */}
        {quoteData.status && quoteData.status !== 'sent' && (
          <div className={`px-4 py-2 border-t border-gray-100 text-center text-xs font-medium ${
            quoteData.status === 'accepted' 
              ? 'bg-green-50 text-green-700' 
              : quoteData.status === 'declined'
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-50 text-gray-600'
          }`}>
            {quoteData.status === 'accepted' && '✅ Devis accepté'}
            {quoteData.status === 'declined' && '❌ Devis refusé'}
            {quoteData.status === 'draft' && '📝 Brouillon'}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteMessage;
