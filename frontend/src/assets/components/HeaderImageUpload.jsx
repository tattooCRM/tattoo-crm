import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useImageRequirements } from '../../hooks/useImageRequirements';

const HeaderImageUpload = ({ 
  headerImage, 
  onHeaderImageChange, 
  onHeaderImageRemove
}) => {
  const { requirements } = useImageRequirements();
  const [validation, setValidation] = useState({ valid: true, errors: [], warnings: [] });
  const [isDragActive, setIsDragActive] = useState(false);

  // Utiliser les exigences du serveur ou fallback
  const headerRequirements = requirements?.headerImage || {
    minWidth: 1200,
    minHeight: 300,
    maxWidth: 2000,
    maxHeight: 800,
    aspectRatio: { min: 2.5, max: 4 },
    maxSize: 5 * 1024 * 1024
  };

  // Fonction pour valider les dimensions côté client
  const validateImageClient = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const { naturalWidth: width, naturalHeight: height } = img;
        const aspectRatio = width / height;
        const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
        
        const result = {
          valid: true,
          errors: [],
          warnings: [],
          metadata: { width, height, size: file.size, aspectRatio, sizeInMB }
        };

        // Vérifier la taille du fichier
        if (file.size > headerRequirements.maxSize) {
          result.valid = false;
          result.errors.push(`Image trop lourde: ${sizeInMB}MB (max: ${(headerRequirements.maxSize / 1024 / 1024)}MB)`);
        }

        // Vérifier les dimensions minimales
        if (width < headerRequirements.minWidth || height < headerRequirements.minHeight) {
          result.valid = false;
          result.errors.push(`Dimensions trop petites: ${width}x${height}px (min: ${headerRequirements.minWidth}x${headerRequirements.minHeight}px)`);
        }

        // Vérifier les dimensions maximales
        if (width > headerRequirements.maxWidth || height > headerRequirements.maxHeight) {
          result.warnings.push(`Dimensions très grandes: ${width}x${height}px (recommandé max: ${headerRequirements.maxWidth}x${headerRequirements.maxHeight}px)`);
        }

        // Vérifier le ratio d'aspect
        if (aspectRatio < headerRequirements.aspectRatio.min || aspectRatio > headerRequirements.aspectRatio.max) {
          result.valid = false;
          result.errors.push(`Ratio d'aspect incorrect: ${aspectRatio.toFixed(2)} (requis: ${headerRequirements.aspectRatio.min}-${headerRequirements.aspectRatio.max} pour un header)`);
        }

        resolve(result);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          errors: ['Impossible de charger l\'image'],
          warnings: [],
          metadata: null
        });
      };
      
      img.src = url;
    });
  };

  const onDrop = async (acceptedFiles) => {
    setIsDragActive(false);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Valider l'image
    const validationResult = await validateImageClient(file);
    setValidation(validationResult);
    
    if (validationResult.valid) {
      onHeaderImageChange(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const handleRemove = () => {
    onHeaderImageRemove();
    setValidation({ valid: true, errors: [], warnings: [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <ImageIcon size={20} className="text-black" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-800">Image de header</h4>
          <p className="text-sm text-gray-600">
            Bannière qui apparaîtra en haut de votre page (1200x400px recommandé)
          </p>
        </div>
      </div>

      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive || dropzoneActive
            ? 'border-gray-400 bg-gray-100 scale-105'
            : validation.errors.length > 0
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        
        {headerImage ? (
          // Aperçu de l'image
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <img
                src={headerImage instanceof File ? URL.createObjectURL(headerImage) : headerImage}
                alt="Header preview"
                className="w-full h-32 object-cover rounded-lg shadow-md"
                style={{ aspectRatio: '3/1' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {headerImage instanceof File ? (
                <div className="space-y-1">
                  <p className="font-medium">{headerImage.name}</p>
                  {validation.metadata && (
                    <p>
                      {validation.metadata.width}x{validation.metadata.height}px • 
                      {validation.metadata.sizeInMB}MB • 
                      Ratio: {validation.metadata.aspectRatio.toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <p>Image existante</p>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Cliquez ou glissez une nouvelle image pour remplacer
            </p>
          </div>
        ) : (
          // État vide
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <ImageIcon size={32} className="text-gray-700" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive || dropzoneActive ? 'Déposez votre image ici' : 'Ajoutez votre image de header'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Glissez votre image ici ou cliquez pour sélectionner
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages de validation */}
      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h5 className="font-medium text-red-800">Erreurs de validation</h5>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <h5 className="font-medium text-yellow-800">Avertissements</h5>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validation.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {headerImage && validation.valid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Image validée avec succès !
            </span>
          </div>
        </div>
      )}

      {/* Informations sur les exigences */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-gray-600" />
          <h5 className="font-medium text-gray-800">Exigences pour l'image de header</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><strong>Dimensions:</strong></p>
            <p>• Minimum: {headerRequirements.minWidth}x{headerRequirements.minHeight}px</p>
            <p>• Recommandé: 1200x400px</p>
            <p>• Maximum: {headerRequirements.maxWidth}x{headerRequirements.maxHeight}px</p>
          </div>
          <div>
            <p><strong>Autres exigences:</strong></p>
            <p>• Taille max: {Math.round(headerRequirements.maxSize / 1024 / 1024)}MB</p>
            <p>• Ratio: {headerRequirements.aspectRatio.min}-{headerRequirements.aspectRatio.max}</p>
            <p>• Formats: JPEG, PNG, GIF, WebP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderImageUpload;
