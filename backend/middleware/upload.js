const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    // Définir le dossier selon le type de fichier
    if (file.fieldname === 'profilePhoto') {
      uploadPath = path.join(__dirname, '../uploads/profiles');
    } else if (file.fieldname === 'gallery') {
      uploadPath = path.join(__dirname, '../uploads/gallery');
    } else if (file.fieldname === 'headerImage') {
      uploadPath = path.join(__dirname, '../uploads/headers');
    } else if (file.fieldname === 'placementPhoto') {
      uploadPath = path.join(__dirname, '../uploads/placement');
    } else {
      uploadPath = path.join(__dirname, '../uploads');
    }
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp + nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, fileName);
  }
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  // Types d'images autorisés
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types acceptés: JPEG, PNG, GIF, WebP`), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB par fichier
    files: 10 // Maximum 10 fichiers
  }
});

// Middleware pour gérer l'upload de page publique
const uploadPublicPageImages = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'headerImage', maxCount: 1 },
  { name: 'gallery', maxCount: 8 }
]);

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Fichier trop volumineux. Taille maximum: 5MB par fichier.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Trop de fichiers. Maximum 8 images pour la galerie.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Fichier inattendu. Vérifiez les champs autorisés.' 
      });
    }
  }
  
  if (err) {
    return res.status(400).json({ 
      message: err.message || 'Erreur lors de l\'upload des fichiers.' 
    });
  }
  
  next();
};

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du fichier ${filePath}:`, error);
  }
};

// Fonction utilitaire pour obtenir l'URL publique d'un fichier
const getPublicUrl = (filePath) => {
  if (!filePath) return null;
  
  // Convertir le chemin absolu en URL relative
  const relativePath = filePath.replace(path.join(__dirname, '../'), '');
  return `http://localhost:5000/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  upload,
  uploadPublicPageImages,
  handleUploadErrors,
  deleteFile,
  getPublicUrl
};
