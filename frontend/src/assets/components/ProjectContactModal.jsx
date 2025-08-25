import React, { useState } from 'react';
import { X, Upload, MapPin, Palette, DollarSign, Calendar, FileText, Camera, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ProjectContactModal = ({ isOpen, onClose, onSubmit, artistName, artistSpecialty, loading }) => {
  const [formData, setFormData] = useState({
    projectType: '',
    bodyZone: '',
    style: '',
    size: '',
    description: '',
    budget: '',
    availability: '',
    hasReferences: false,
    references: [],
    isIntimate: false,
    placementPhoto: null,
    placementPhotoPreview: null
  });

  const [errors, setErrors] = useState({});

  const projectTypes = [
    { value: 'first', label: 'Mon premier tatouage' },
    { value: 'addition', label: 'Ajout à ma collection' },
    { value: 'coverup', label: 'Cover-up' },
    { value: 'rework', label: 'Retouche/Réparation' }
  ];

  const bodyZones = [
    { value: 'arm', label: 'Bras' },
    { value: 'leg', label: 'Jambe' },
    { value: 'back', label: 'Dos' },
    { value: 'chest', label: 'Poitrine' },
    { value: 'shoulder', label: 'Épaule' },
    { value: 'wrist', label: 'Poignet' },
    { value: 'ankle', label: 'Cheville' },
    { value: 'neck', label: 'Nuque' },
    { value: 'other', label: 'Autre' }
  ];

  const styles = [
    { value: 'realistic', label: 'Réaliste' },
    { value: 'traditional', label: 'Traditionnel' },
    { value: 'geometric', label: 'Géométrique' },
    { value: 'minimalist', label: 'Minimaliste' },
    { value: 'blackwork', label: 'Blackwork' },
    { value: 'watercolor', label: 'Aquarelle' },
    { value: 'tribal', label: 'Tribal' },
    { value: 'japanese', label: 'Japonais' },
    { value: 'other', label: 'Autre' }
  ];

  const sizes = [
    { value: 'small', label: 'Petit (< 5cm)' },
    { value: 'medium', label: 'Moyen (5-15cm)' },
    { value: 'large', label: 'Grand (15-30cm)' },
    { value: 'xlarge', label: 'Très grand (> 30cm)' }
  ];

  const budgetRanges = [
    { value: '0-100', label: '50€ - 100€' },
    { value: '100-200', label: '100€ - 200€' },
    { value: '200-500', label: '200€ - 500€' },
    { value: '500-1000', label: '500€ - 1000€' },
    { value: '1000+', label: '1000€+' },
    { value: 'discuss', label: 'À discuter' }
  ];

  const availabilityOptions = [
    { value: 'flexible', label: 'Flexible' },
    { value: 'weekdays', label: 'Semaine uniquement' },
    { value: 'weekends', label: 'Week-ends uniquement' },
    { value: 'evenings', label: 'Soirées' },
    { value: 'asap', label: 'Dès que possible' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur si elle existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Fonction pour gérer l'upload de photo de placement
  const handlePlacementPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, placementPhoto: 'La photo ne doit pas dépasser 5MB' }));
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, placementPhoto: 'Veuillez sélectionner une image valide' }));
        return;
      }

      // Créer l'URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        placementPhoto: file,
        placementPhotoPreview: previewUrl
      }));

      // Effacer l'erreur
      if (errors.placementPhoto) {
        setErrors(prev => ({ ...prev, placementPhoto: null }));
      }
    }
  };

  const removePlacementPhoto = () => {
    if (formData.placementPhotoPreview) {
      URL.revokeObjectURL(formData.placementPhotoPreview);
    }
    setFormData(prev => ({
      ...prev,
      placementPhoto: null,
      placementPhotoPreview: null
    }));
  };

  // Gestion du drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      // Utiliser la même logique que handlePlacementPhotoUpload
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, placementPhoto: 'La photo ne doit pas dépasser 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, placementPhoto: 'Veuillez sélectionner une image valide' }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        placementPhoto: file,
        placementPhotoPreview: previewUrl
      }));

      if (errors.placementPhoto) {
        setErrors(prev => ({ ...prev, placementPhoto: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectType) newErrors.projectType = 'Veuillez sélectionner un type de projet';
    if (!formData.bodyZone) newErrors.bodyZone = 'Veuillez indiquer la zone du corps';
    if (!formData.style) newErrors.style = 'Veuillez sélectionner un style';
    if (!formData.size) newErrors.size = 'Veuillez indiquer la taille';
    if (!formData.description.trim()) newErrors.description = 'Veuillez décrire votre projet';
    if (formData.description.trim().length < 10) newErrors.description = 'Description trop courte (minimum 10 caractères)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const projectData = {
      ...formData,
      artistName,
      artistSpecialty,
      submittedAt: new Date()
    };

    onSubmit(projectData);
  };

  const handleReset = () => {
    setFormData({
      projectType: '',
      bodyZone: '',
      style: '',
      size: '',
      description: '',
      budget: '',
      availability: '',
      hasReferences: false,
      references: [],
      isIntimate: false,
      placementPhoto: null,
      placementPhotoPreview: null
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Demander un devis</h2>
            <p className="text-xs text-gray-600">
              Décrivez votre projet à <span className="font-medium">{artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type de projet */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <FileText size={16} className="inline mr-1" />
                Type de projet *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {projectTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('projectType', type.value)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      formData.projectType === type.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {errors.projectType && (
                <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>
              )}
            </div>

            {/* Zone du corps */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Zone du corps *
              </label>
              <select
                value={formData.bodyZone}
                onChange={(e) => handleInputChange('bodyZone', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white text-gray-900 bg-white ${
                  errors.bodyZone ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Sélectionnez une zone</option>
                {bodyZones.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
              {errors.bodyZone && (
                <p className="text-red-500 text-xs mt-1">{errors.bodyZone}</p>
              )}
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Palette size={16} className="inline mr-1" />
                Style souhaité *
              </label>
              <select
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white text-gray-900 bg-white ${
                  errors.style ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Sélectionnez un style</option>
                {styles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
              {errors.style && (
                <p className="text-red-500 text-xs mt-1">{errors.style}</p>
              )}
            </div>

            {/* Taille */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Taille approximative *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => handleInputChange('size', size.value)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      formData.size === size.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900 bg-white'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              {errors.size && (
                <p className="text-red-500 text-xs mt-1">{errors.size}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description du projet *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre idée, vos inspirations, l'histoire derrière ce tatouage..."
                rows={4}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white resize-none text-gray-900 bg-white ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description.length} caractères
                </p>
              </div>
            </div>

            {/* Budget (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Budget approximatif
              </label>
              <select
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Préférez ne pas préciser</option>
                {budgetRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Disponibilités (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Disponibilités
              </label>
              <select
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Sélectionnez vos créneaux</option>
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone intime */}
            <div>
              <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isIntimate"
                  checked={formData.isIntimate}
                  onChange={(e) => handleInputChange('isIntimate', e.target.checked)}
                  className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="isIntimate" className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Zone intime
                  </label>
                  <p className="text-xs text-orange-700 mt-1">
                    Cochez cette case si le tatouage sera placé sur une zone intime. 
                    Cela permet au tatoueur de prendre les précautions nécessaires et d'adapter sa préparation.
                  </p>
                </div>
              </div>
            </div>

            {/* Photo de placement */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Camera size={16} className="inline mr-1" />
                Photo de l'emplacement
                <span className="text-xs text-gray-500 font-normal ml-2">(Recommandé)</span>
              </label>
              
              {!formData.placementPhotoPreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="placementPhoto"
                    accept="image/*"
                    onChange={handlePlacementPhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="placementPhoto"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-medium text-gray-900">
                        Ajoutez une photo de l'emplacement
                      </p>
                      <p className="text-sm text-gray-500">
                        Aide le tatoueur à adapter le design à votre morphologie
                      </p>
                      <p className="text-xs text-gray-400">
                        Glissez-déposez ou cliquez • JPG, PNG • Max 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.placementPhotoPreview}
                    alt="Aperçu de l'emplacement"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePlacementPhoto}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Photo de placement
                  </div>
                </div>
              )}
              
              {errors.placementPhoto && (
                <p className="text-red-500 text-xs mt-1">{errors.placementPhoto}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Une photo claire de l'emplacement aide le tatoueur à créer un stencil parfaitement adapté à votre morphologie
              </p>

            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="text-xs text-gray-500">
            <p>Spécialité de {artistName}: <span className="font-medium">{artistSpecialty}</span></p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                'Envoyer ma demande'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectContactModal;
