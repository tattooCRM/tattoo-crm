import React from 'react';
import { MapPin, Palette, DollarSign, Calendar, FileText, Camera, Eye, Clock, AlertTriangle } from 'lucide-react';

const ProjectMessage = ({ projectData, timestamp, isOwn }) => {
  const projectTypeLabels = {
    'first': 'Mon premier tatouage',
    'addition': 'Ajout à ma collection',
    'coverup': 'Cover-up',
    'rework': 'Retouche/Réparation'
  };

  const bodyZoneLabels = {
    'arm': 'Bras',
    'leg': 'Jambe',
    'back': 'Dos',
    'chest': 'Poitrine',
    'shoulder': 'Épaule',
    'wrist': 'Poignet',
    'ankle': 'Cheville',
    'neck': 'Nuque',
    'other': 'Autre'
  };

  const styleLabels = {
    'realistic': 'Réaliste',
    'traditional': 'Traditionnel',
    'geometric': 'Géométrique',
    'minimalist': 'Minimaliste',
    'blackwork': 'Blackwork',
    'watercolor': 'Aquarelle',
    'tribal': 'Tribal',
    'japanese': 'Japonais',
    'other': 'Autre'
  };

  const sizeLabels = {
    'small': 'Petit (< 5cm)',
    'medium': 'Moyen (5-15cm)',
    'large': 'Grand (15-30cm)',
    'xlarge': 'Très grand (> 30cm)'
  };

  const budgetLabels = {
    '0-100': '50€ - 100€',
    '100-200': '100€ - 200€',
    '200-500': '200€ - 500€',
    '500-1000': '500€ - 1000€',
    '1000+': '1000€+',
    'discuss': 'À discuter'
  };

  const availabilityLabels = {
    'flexible': 'Flexible',
    'weekdays': 'Semaine uniquement',
    'weekends': 'Week-ends uniquement',
    'evenings': 'Soirées',
    'asap': 'Dès que possible'
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`${
      isOwn ? 'max-w-2xl ml-auto' : 'max-w-2xl mr-auto'
    } bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm`}>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500 text-white p-2 rounded-full">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-base">
            Nouvelle demande de projet
          </h4>
          <p className="text-sm text-gray-600">
            Demande de devis personnalisé
          </p>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* Type de projet */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <FileText size={16} className="text-blue-600" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
            <p className="text-sm font-medium text-gray-900">
              {projectTypeLabels[projectData.projectType] || projectData.projectType}
            </p>
          </div>
        </div>

        {/* Zone du corps */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <MapPin size={16} className="text-green-600" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zone</p>
            <p className="text-sm font-medium text-gray-900">
              {bodyZoneLabels[projectData.bodyZone] || projectData.bodyZone}
            </p>
          </div>
        </div>

        {/* Style */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <Palette size={16} className="text-purple-600" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Style</p>
            <p className="text-sm font-medium text-gray-900">
              {styleLabels[projectData.style] || projectData.style}
            </p>
          </div>
        </div>

        {/* Taille */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <div className="w-4 h-4 bg-orange-600 rounded-sm"></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taille</p>
            <p className="text-sm font-medium text-gray-900">
              {sizeLabels[projectData.size] || projectData.size}
            </p>
          </div>
        </div>

        {/* Budget */}
        {projectData.budget && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <DollarSign size={16} className="text-green-600" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</p>
              <p className="text-sm font-medium text-gray-900">
                {budgetLabels[projectData.budget] || projectData.budget}
              </p>
            </div>
          </div>
        )}

        {/* Disponibilités */}
        {projectData.availability && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Calendar size={16} className="text-blue-600" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Disponibilité</p>
              <p className="text-sm font-medium text-gray-900">
                {availabilityLabels[projectData.availability] || projectData.availability}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg p-4 border mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Description du projet
        </p>
        <p className="text-sm text-gray-900 leading-relaxed">
          {projectData.description}
        </p>
      </div>

      {/* Special Considerations */}
      <div className="space-y-3">
        
        {/* Zone intime */}
        {projectData.isIntimate && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={16} className="text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Zone intime
              </p>
              <p className="text-xs text-amber-700">
                Des précautions particulières sont nécessaires
              </p>
            </div>
          </div>
        )}

        {/* Photo de placement */}
        {projectData.placementPhoto && (
          <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <Camera size={16} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Photo de placement fournie
                </p>
                <p className="text-xs text-green-700">
                  Aide pour adapter le stencil et positionner le tatouage
                </p>
              </div>
            </div>
            
            {/* Image preview */}
            {projectData.placementPhoto && (
              <div className="px-3 pb-3">
                <img 
                  src={
                    // Si c'est un chemin du serveur, l'utiliser avec l'URL de base
                    projectData.placementPhoto.startsWith('/uploads/') 
                      ? `http://localhost:5000${projectData.placementPhoto}`
                      : // Sinon, c'est peut-être une URL de preview (blob)
                      projectData.placementPhotoPreview || projectData.placementPhoto
                  } 
                  alt="Photo de placement" 
                  className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm border"
                  onError={(e) => {
                    console.error('Erreur chargement image:', e);
                    // Cacher l'image en cas d'erreur
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer avec timestamp */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-200">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-blue-600" />
          <span className="text-xs text-blue-700">
            Envoyé le {new Date(projectData.submittedAt).toLocaleDateString('fr-FR')} à {new Date(projectData.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="text-xs text-blue-600 font-medium">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ProjectMessage;
