import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, User, Eye, Edit, CheckCircle2, XCircle, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const statusLabels = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    design_phase: { label: 'Phase design', color: 'bg-blue-100 text-blue-800', icon: Edit },
    scheduled: { label: 'Planifié', color: 'bg-purple-100 text-purple-800', icon: Calendar },
    in_progress: { label: 'En cours', color: 'bg-orange-100 text-orange-800', icon: Play },
    completed: { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const sizeLabels = {
    small: 'Petit (< 5cm)',
    medium: 'Moyen (5-15cm)',
    large: 'Grand (15-30cm)',
    xlarge: 'Très grand (> 30cm)'
  };

  const styleLabels = {
    realistic: 'Réaliste',
    traditional: 'Traditionnel',
    geometric: 'Géométrique',
    minimalist: 'Minimaliste',
    blackwork: 'Blackwork',
    watercolor: 'Aquarelle',
    tribal: 'Tribal',
    japanese: 'Japonais',
    other: 'Autre'
  };

  const bodyZoneLabels = {
    arm: 'Bras',
    leg: 'Jambe',
    back: 'Dos',
    chest: 'Poitrine',
    shoulder: 'Épaule',
    wrist: 'Poignet',
    ankle: 'Cheville',
    neck: 'Nuque',
    other: 'Autre'
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Erreur lors du chargement des projets');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${project.clientId.nom} ${project.clientId.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setShowModal(false);
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadProjects(); // Recharger les projets
        closeProjectModal();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projets</h1>
        <p className="text-gray-600">Gérez tous vos projets de tatouage</p>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par numéro, titre ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(statusLabels).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total projets</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Eye size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En cours</p>
              <p className="text-2xl font-bold text-orange-600">
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Play size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Terminés</p>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Planifiés</p>
              <p className="text-2xl font-bold text-purple-600">
                {projects.filter(p => p.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun projet ne correspond à vos critères de recherche.' 
                : 'Vos projets apparaîtront ici quand des clients accepteront vos devis.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const StatusIcon = statusLabels[project.status]?.icon || AlertCircle;
                  return (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.projectNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {project.clientId.nom} {project.clientId.prenom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.clientId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[project.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon size={14} className="mr-1" />
                          {statusLabels[project.status]?.label || project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.totalAmount.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openProjectModal(project)}
                          className="text-black hover:text-gray-700 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails du projet */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProject.projectNumber}
                  </h2>
                  <p className="text-gray-600">{selectedProject.title}</p>
                </div>
                <button
                  onClick={closeProjectModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Informations du projet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails du projet</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Style:</span>
                      <span className="ml-2 text-sm text-gray-900">{styleLabels[selectedProject.style] || selectedProject.style}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Zone:</span>
                      <span className="ml-2 text-sm text-gray-900">{bodyZoneLabels[selectedProject.bodyZone] || selectedProject.bodyZone}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Taille:</span>
                      <span className="ml-2 text-sm text-gray-900">{sizeLabels[selectedProject.size] || selectedProject.size}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Durée estimée:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProject.estimatedDuration}h</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Séances prévues:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProject.sessionCount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Client</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nom:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedProject.clientId.nom} {selectedProject.clientId.prenom}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProject.clientId.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>

              {/* Actions de changement de statut */}
              <div className="flex flex-wrap gap-2">
                <h3 className="w-full text-lg font-semibold text-gray-900 mb-3">Changer le statut</h3>
                {Object.entries(statusLabels).map(([status, { label, color }]) => (
                  <button
                    key={status}
                    onClick={() => updateProjectStatus(selectedProject._id, status)}
                    disabled={selectedProject.status === status}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedProject.status === status 
                        ? `${color} cursor-not-allowed` 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
