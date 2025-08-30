import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmModal from '../components/ConfirmModal';
import SendQuoteModal from '../components/SendQuoteModal';
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Euro,
  Calendar,
  User
} from 'lucide-react';

const DashboardQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    loadQuotes();
  }, [filter]);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? 'http://localhost:5000/api/quotes'
        : `http://localhost:5000/api/quotes?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      } else {
        console.error('Erreur lors du chargement des devis');
        toast.error('Erreur lors du chargement des devis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion lors du chargement des devis');
    }
    setIsLoading(false);
  };

  const handleDeleteQuote = async (quoteId) => {
    const quote = quotes.find(q => q._id === quoteId);
    
    const confirmed = await confirm({
      title: 'Supprimer le devis',
      message: `Êtes-vous sûr de vouloir supprimer le devis ${quote?.quoteNumber || quoteId} ?

Cette action est irréversible et supprimera définitivement :
- Le devis et tous ses éléments
- L'historique associé

Confirmez-vous la suppression ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setQuotes(quotes.filter(q => q._id !== quoteId));
        toast.success('Devis supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du devis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du devis');
    }
  };

  // Nouveau workflow d'envoi avec composant SendQuoteModal
  const openSendModal = (quote) => {
    setSelectedQuote(quote);
    setSendModalOpen(true);
  };

  const closeSendModal = () => {
    setSendModalOpen(false);
    setSelectedQuote(null);
  };

  const handleSendQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${selectedQuote._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await loadQuotes(); // Recharger les devis
        toast.success('Devis envoyé avec succès au client');
        closeSendModal();
      } else {
        toast.error('Erreur lors de l\'envoi du devis');
      }
    } catch (error) {
      console.error('Erreur envoi devis:', error);
      toast.error('Erreur lors de l\'envoi du devis');
    }
  };

  const handleViewQuote = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Nettoyer l'URL après un délai
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        toast.success('PDF ouvert dans un nouvel onglet');
      } else {
        toast.error('Erreur lors de la visualisation du PDF');
      }
    } catch (error) {
      console.error('Erreur visualisation PDF:', error);
      toast.error('Erreur lors de la visualisation du PDF');
    }
  };

  const handleDownloadQuote = async (quoteId, quoteNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Devis-${quoteNumber || quoteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF téléchargé avec succès');
      } else {
        toast.error('Erreur lors du téléchargement du PDF');
      }
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.clientInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'sent': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'declined': return 'Refusé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculer les statistiques avancées
  const stats = React.useMemo(() => {
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
    const sentQuotes = quotes.filter(q => q.status === 'sent');
    const draftQuotes = quotes.filter(q => q.status === 'draft');
    const declinedQuotes = quotes.filter(q => q.status === 'declined');
    
    const revenue = acceptedQuotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
    const pending = sentQuotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
    const averageQuoteValue = quotes.length > 0 ? quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / quotes.length : 0;
    
    // Taux de conversion (acceptés / envoyés)
    const totalSentOrAccepted = sentQuotes.length + acceptedQuotes.length + declinedQuotes.length;
    const conversionRate = totalSentOrAccepted > 0 ? (acceptedQuotes.length / totalSentOrAccepted) * 100 : 0;
    
    return {
      total: quotes.length,
      draft: draftQuotes.length,
      sent: sentQuotes.length,
      accepted: acceptedQuotes.length,
      declined: declinedQuotes.length,
      revenue,
      pending,
      averageQuoteValue,
      conversionRate
    };
  }, [quotes]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Devis</h1>
              <p className="mt-2 text-gray-600">
                Gérez tous vos devis clients et suivez votre chiffre d'affaires
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total des devis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total des devis</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform duration-200">
                  {stats.total}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">Moyenne: {stats.averageQuoteValue.toFixed(0)} €</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Taux de conversion */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Taux de conversion</p>
                <p className="text-3xl font-bold text-green-600 mt-1 group-hover:scale-105 transition-transform duration-200">
                  {stats.conversionRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{stats.accepted} acceptés</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* En attente */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">En attente</p>
                <p className="text-3xl font-bold text-blue-600 mt-1 group-hover:scale-105 transition-transform duration-200">
                  {stats.sent}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">Valeur: {stats.pending.toFixed(0)} €</p>
                  {stats.sent > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Actifs
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Chiffre d'affaires */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform duration-200">
                  {new Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(stats.revenue)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">{stats.accepted} devis confirmés</p>
                  {stats.revenue > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{((stats.revenue / (stats.revenue + stats.pending)) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200">
                <Euro className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées (row supplémentaire) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Brouillons</p>
                <p className="text-xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <Edit className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Refusés</p>
                <p className="text-xl font-bold text-red-900">{stats.declined}</p>
              </div>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Potentiel</p>
                <p className="text-xl font-bold text-blue-900">
                  {new Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(stats.pending)}
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filtres par statut */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'Tous', count: stats.total },
                  { key: 'draft', label: 'Brouillons', count: stats.draft },
                  { key: 'sent', label: 'Envoyés', count: stats.sent },
                  { key: 'accepted', label: 'Acceptés', count: stats.accepted }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        filter === key 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white text-gray-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full lg:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un devis ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full lg:w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Liste des devis */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des devis...</p>
            </div>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Aucun devis trouvé' : 'Aucun devis'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche'
                  : 'Créez votre premier devis depuis une conversation client'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devis
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {quote.quoteNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {quote.title || 'Devis sans titre'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {quote.clientInfo?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quote.clientInfo?.name || 'Client inconnu'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {quote.clientInfo?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {(quote.totalAmount || 0).toFixed(2)} €
                        </div>
                        {quote.taxAmount > 0 && (
                          <div className="text-xs text-gray-500">
                            dont {quote.taxAmount.toFixed(2)} € TVA
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(quote.createdAt)}
                        </div>
                        {quote.sentAt && (
                          <div className="text-xs text-gray-500">
                            Envoyé le {formatDate(quote.sentAt)}
                          </div>
                        )}
                        {quote.validUntil && (
                          <div className="text-xs text-gray-500">
                            Expire le {formatDate(quote.validUntil)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewQuote(quote._id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir le devis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => openSendModal(quote)}
                            className="inline-flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300 text-sm"
                            title="Envoyer au client"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Envoyer
                          </button>
                          
                          <button
                            onClick={() => handleDownloadQuote(quote._id, quote.quoteNumber)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          {quote.status === 'draft' && (
                            <button
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteQuote(quote._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Résumé en bas */}
        {filteredQuotes.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-600">
                  <strong className="text-gray-900">{filteredQuotes.length}</strong> devis affichés
                </span>
                <span className="text-gray-600">
                  Montant total: <strong className="text-gray-900">
                    {filteredQuotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0).toFixed(2)} €
                  </strong>
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />

      {/* Modale d'envoi du devis avec composant dédié */}
      <SendQuoteModal
        isOpen={sendModalOpen}
        onClose={closeSendModal}
        quote={selectedQuote}
        onSend={handleSendQuote}
      />
    </div>
  );
};

export default DashboardQuotes;
