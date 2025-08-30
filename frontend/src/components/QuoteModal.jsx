import React, { useState } from 'react';
import { X, Download, Check, XCircle, Loader2 } from 'lucide-react';

export default function QuoteModal({ isOpen, onClose, quoteId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAcceptQuote = async () => {
    setActionLoading('accept');
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation du devis');
      }

      // Fermer la modal et rafraîchir la conversation
      onClose();
      
      // Optionnel : afficher une notification de succès
      // toast.success('Devis accepté avec succès !');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectQuote = async () => {
    setActionLoading('reject');
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du refus du devis');
      }

      // Fermer la modal et rafraîchir la conversation
      onClose();
      
      // Optionnel : afficher une notification
      // toast.info('Devis refusé');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pdfUrl = `http://localhost:5000/api/quotes/${quoteId}/pdf`;
  const downloadUrl = `${pdfUrl}?download=1`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Devis</h2>
            <p className="text-sm text-gray-600">Consultez et répondez au devis</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-6">
          <div className="bg-gray-100 rounded-lg h-96 mb-6 flex items-center justify-center">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg"
              title="Devis PDF"
              onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Bouton Télécharger */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download size={16} />
              Télécharger PDF
            </a>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={handleRejectQuote}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-2 px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'reject' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Refuser
              </button>

              <button
                onClick={handleAcceptQuote}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'accept' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
