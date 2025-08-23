const sharp = require('sharp');

// Dimensions recommandées pour les différents types d'images
const IMAGE_REQUIREMENTS = {
  headerImage: {
    minWidth: 1200,
    minHeight: 300,
    maxWidth: 2000,
    maxHeight: 800,
    aspectRatio: { min: 2.5, max: 4 }, // Ratio largeur/hauteur
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  profilePhoto: {
    minWidth: 200,
    minHeight: 200,
    maxWidth: 1000,
    maxHeight: 1000,
    aspectRatio: { min: 0.8, max: 1.2 }, // Proche du carré
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  gallery: {
    minWidth: 300,
    minHeight: 300,
    maxWidth: 2000,
    maxHeight: 2000,
    maxSize: 3 * 1024 * 1024 // 3MB
  }
};

/**
 * Valide les dimensions et les caractéristiques d'une image
 * @param {string} imagePath - Chemin vers l'image
 * @param {string} imageType - Type d'image (headerImage, profilePhoto, gallery)
 * @returns {Promise<object>} - Résultat de la validation
 */
const validateImageDimensions = async (imagePath, imageType) => {
  try {
    const requirements = IMAGE_REQUIREMENTS[imageType];
    if (!requirements) {
      throw new Error(`Type d'image non supporté: ${imageType}`);
    }

    // Obtenir les métadonnées de l'image
    const metadata = await sharp(imagePath).metadata();
    const { width, height, size } = metadata;
    
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      metadata: {
        width,
        height,
        size,
        aspectRatio: width / height,
        format: metadata.format
      }
    };

    // Vérifier la taille du fichier
    if (size > requirements.maxSize) {
      result.valid = false;
      result.errors.push(`Image trop lourde: ${(size / 1024 / 1024).toFixed(2)}MB (max: ${(requirements.maxSize / 1024 / 1024)}MB)`);
    }

    // Vérifier les dimensions minimales
    if (width < requirements.minWidth || height < requirements.minHeight) {
      result.valid = false;
      result.errors.push(`Dimensions trop petites: ${width}x${height} (min: ${requirements.minWidth}x${requirements.minHeight})`);
    }

    // Vérifier les dimensions maximales
    if (width > requirements.maxWidth || height > requirements.maxHeight) {
      result.warnings.push(`Dimensions très grandes: ${width}x${height} (recommandé max: ${requirements.maxWidth}x${requirements.maxHeight})`);
    }

    // Vérifier le ratio d'aspect si défini
    if (requirements.aspectRatio) {
      const aspectRatio = width / height;
      if (aspectRatio < requirements.aspectRatio.min || aspectRatio > requirements.aspectRatio.max) {
        if (imageType === 'headerImage') {
          result.valid = false;
          result.errors.push(`Ratio d'aspect incorrect: ${aspectRatio.toFixed(2)} (requis: ${requirements.aspectRatio.min}-${requirements.aspectRatio.max} pour un header)`);
        } else {
          result.warnings.push(`Ratio d'aspect inhabituel: ${aspectRatio.toFixed(2)} (recommandé: ${requirements.aspectRatio.min}-${requirements.aspectRatio.max})`);
        }
      }
    }

    return result;

  } catch (error) {
    return {
      valid: false,
      errors: [`Erreur lors de l'analyse de l'image: ${error.message}`],
      warnings: [],
      metadata: null
    };
  }
};

/**
 * Redimensionne une image selon les exigences du type
 * @param {string} inputPath - Chemin de l'image source
 * @param {string} outputPath - Chemin de sortie
 * @param {string} imageType - Type d'image
 * @returns {Promise<object>} - Résultat du redimensionnement
 */
const resizeImage = async (inputPath, outputPath, imageType) => {
  try {
    const requirements = IMAGE_REQUIREMENTS[imageType];
    if (!requirements) {
      throw new Error(`Type d'image non supporté: ${imageType}`);
    }

    let sharpInstance = sharp(inputPath);
    
    // Redimensionner selon le type
    if (imageType === 'headerImage') {
      // Pour les headers, on privilégie la largeur et on coupe si nécessaire
      sharpInstance = sharpInstance
        .resize(1200, 400, { 
          fit: 'cover', 
          position: 'center' 
        });
    } else if (imageType === 'profilePhoto') {
      // Pour les profils, on fait un carré
      sharpInstance = sharpInstance
        .resize(400, 400, { 
          fit: 'cover', 
          position: 'center' 
        });
    } else if (imageType === 'gallery') {
      // Pour la galerie, on limite la taille max en gardant les proportions
      sharpInstance = sharpInstance
        .resize(800, 800, { 
          fit: 'inside', 
          withoutEnlargement: true 
        });
    }

    // Optimiser la qualité
    sharpInstance = sharpInstance
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 8 });

    await sharpInstance.toFile(outputPath);

    return {
      success: true,
      message: `Image redimensionnée avec succès pour ${imageType}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Erreur lors du redimensionnement: ${error.message}`
    };
  }
};

module.exports = {
  validateImageDimensions,
  resizeImage,
  IMAGE_REQUIREMENTS
};
