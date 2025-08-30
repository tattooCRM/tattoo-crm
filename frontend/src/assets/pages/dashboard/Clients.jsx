import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, Calendar } from 'lucide-react';
import { useNotificationsSystem } from '../../../contexts/NotificationsContext';
import { useToast } from '../../../hooks/useToast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    notes: ''
  });

  const { addClientCreatedNotification, addClientUpdatedNotification, addSystemNotification } = useNotificationsSystem();
  const { showToast } = useToast();

  // Charger les clients depuis l'API
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        console.error('Erreur lors du chargement des clients');
        showToast('Erreur lors du chargement des clients', 'error');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      showToast('Erreur lors du chargement des clients', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom) {
      showToast('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    try {
      if (editingClient) {
        // Modification
        const updatedClient = { ...editingClient, ...formData };
        setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
        addClientUpdatedNotification(`${formData.prenom} ${formData.nom}`);
        showToast('Client modifié avec succès', 'success');
      } else {
        // Création
        const newClient = {
          id: Date.now(),
          ...formData,
          createdAt: new Date()
        };
        setClients(prev => [newClient, ...prev]);
        addClientCreatedNotification(`${formData.prenom} ${formData.nom}`);
        showToast('Client ajouté avec succès', 'success');
      }
      
      resetForm();
    } catch (error) {
      addSystemNotification('Erreur', 'Impossible de sauvegarder le client', 'error');
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowModal(true);
  };

  const handleDelete = (client) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ?`)) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      addSystemNotification('Client supprimé', `${client.prenom} ${client.nom} a été supprimé`, 'warning');
      showToast('Client supprimé', 'success');
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', telephone: '', notes: '' });
    setEditingClient(null);
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nouveau client
        </button>
      </div>

      {/* Liste des clients */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {client.prenom} {client.nom}
                </h3>
                <p className="text-xs text-gray-500">
                  Client depuis le {client.createdAt.toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit size={14} className="text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(client)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail size={14} />
                {client.email}
              </div>
            )}
            
            {client.telephone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Phone size={14} />
                {client.telephone}
              </div>
            )}
            
            {client.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                {client.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
          <p className="text-gray-600 mb-4">Ajoutez votre premier client pour commencer</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Ajouter un client
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Notes sur le client, préférences..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  {editingClient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
