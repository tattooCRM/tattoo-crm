const express = require('express');
const router = express.Router();
const PublicPage = require('../models/PublicPage');
const User = require('../models/User');
const { uploadPublicPageImages, handleUploadErrors, getPublicUrl, deleteFile } = require('../middleware/upload');
const { validateImageDimensions, IMAGE_REQUIREMENTS } = require('../utils/imageValidator');
const chatController = require('../controllers/chatController');
const path = require('path');

// GET /api/public-pages/image-requirements - Obtenir les exigences pour les images
router.get('/image-requirements', (req, res) => {
    try {
        res.json({
            requirements: IMAGE_REQUIREMENTS,
            message: 'Exigences pour les images de page publique'
        });
    } catch (error) {
        console.error('Erreur récupération exigences images:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET /api/public-pages/user/:userId - Récupérer la page d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const page = await PublicPage.findOne({ userId }).populate('userId', 'name email');
        
        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        res.json(page);
    } catch (error) {
        console.error('Erreur récupération page utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET /api/public-pages/slug/:slug - Récupérer une page par son slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const page = await PublicPage.findOne({ 
            slug: slug.toLowerCase(),
            isActive: true 
        }).populate('userId', 'name email');
        
        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        // Incrémenter le nombre de vues
        page.views += 1;
        await page.save();

        res.json(page);
    } catch (error) {
        console.error('Erreur récupération page par slug:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// Route publique pour récupérer un tatoueur par son slug (sans authentification)
router.get('/tattoo-artist/:slug', chatController.getTattooArtistBySlug);

// POST /api/public-pages - Créer une nouvelle page (avec upload d'images)
router.post('/', uploadPublicPageImages, handleUploadErrors, async (req, res) => {
    try {
        const { 
            userId, 
            username, 
            slug, 
            title, 
            description, 
            theme, 
            instagram,
            phone,
            email,
            address,
            website,
            openingHours,
            pricing
        } = req.body;

        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur a déjà une page
        const existingPage = await PublicPage.findOne({ userId });
        if (existingPage) {
            return res.status(400).json({ message: 'Vous avez déjà une page publique' });
        }

        // Générer le slug s'il n'est pas fourni
        let finalSlug = slug;
        if (!finalSlug && username) {
            finalSlug = username
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }

        // Vérifier que le slug est unique
        const existingSlug = await PublicPage.findOne({ slug: finalSlug });
        if (existingSlug) {
            return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
        }

        // Traiter les fichiers uploadés
        let profilePhotoUrl = null;
        let galleryUrls = [];
        let headerImageUrl = null;
        const validationResults = [];

        if (req.files) {
            // Photo de profil
            if (req.files.profilePhoto && req.files.profilePhoto[0]) {
                const validation = await validateImageDimensions(req.files.profilePhoto[0].path, 'profilePhoto');
                if (!validation.valid) {
                    return res.status(400).json({ 
                        message: 'Image de profil invalide', 
                        errors: validation.errors 
                    });
                }
                profilePhotoUrl = getPublicUrl(req.files.profilePhoto[0].path);
                if (validation.warnings.length > 0) {
                    validationResults.push({ type: 'profilePhoto', warnings: validation.warnings });
                }
            }

            // Image de header
            if (req.files.headerImage && req.files.headerImage[0]) {
                const validation = await validateImageDimensions(req.files.headerImage[0].path, 'headerImage');
                if (!validation.valid) {
                    return res.status(400).json({ 
                        message: 'Image de header invalide', 
                        errors: validation.errors 
                    });
                }
                headerImageUrl = getPublicUrl(req.files.headerImage[0].path);
                if (validation.warnings.length > 0) {
                    validationResults.push({ type: 'headerImage', warnings: validation.warnings });
                }
            }

            // Galerie d'images
            if (req.files.gallery) {
                for (const file of req.files.gallery) {
                    const validation = await validateImageDimensions(file.path, 'gallery');
                    if (!validation.valid) {
                        return res.status(400).json({ 
                            message: 'Une image de la galerie est invalide', 
                            errors: validation.errors 
                        });
                    }
                }
                galleryUrls = req.files.gallery.map(file => getPublicUrl(file.path));
            }
        }

        // Créer la page
        const newPage = new PublicPage({
            userId,
            username: username.trim(),
            slug: finalSlug,
            title: title.trim(),
            description: description?.trim(),
            theme: theme || 'dark',
            headerImage: headerImageUrl,
            instagram: instagram?.trim(),
            phone: phone?.trim(),
            email: email?.trim(),
            address: address?.trim(),
            website: website?.trim(),
            openingHours: openingHours?.trim(),
            pricing: pricing?.trim(),
            profilePhoto: profilePhotoUrl,
            gallery: galleryUrls
        });

        const savedPage = await newPage.save();
        const populatedPage = await PublicPage.findById(savedPage._id).populate('userId', 'name email');

        // Inclure les avertissements de validation si il y en a
        const response = {
            ...populatedPage.toObject(),
            validationResults: validationResults.length > 0 ? validationResults : undefined
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Erreur création page:', error);
        
        if (error.code === 11000) {
            // Erreur de duplication
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ 
                message: `Ce ${field === 'slug' ? 'nom d\'utilisateur' : field} est déjà utilisé` 
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }

        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// PUT /api/public-pages/:id - Mettre à jour une page (avec upload d'images)
router.put('/:id', uploadPublicPageImages, handleUploadErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            username, 
            slug, 
            title, 
            description, 
            theme, 
            instagram,
            phone,
            email,
            address,
            website,
            openingHours,
            pricing,
            settings 
        } = req.body;

        const page = await PublicPage.findById(id);
        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        // Générer nouveau slug si le username a changé
        let newSlug = slug;
        if (username && username !== page.username) {
            newSlug = username
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            // Vérifier que le nouveau slug est unique
            const existingSlug = await PublicPage.findOne({ 
                slug: newSlug, 
                _id: { $ne: id } 
            });
            if (existingSlug) {
                return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
            }
        }

        // Traiter les nouveaux fichiers uploadés
        let profilePhotoUrl = page.profilePhoto; // Conserver l'ancienne photo par défaut
        let galleryUrls = [...page.gallery]; // Conserver l'ancienne galerie

        if (req.files) {
            // Nouvelle photo de profil
            if (req.files.profilePhoto && req.files.profilePhoto[0]) {
                // Supprimer l'ancienne photo si elle existe
                if (page.profilePhoto) {
                    const oldPath = page.profilePhoto.replace('http://localhost:5000/', '');
                    deleteFile(path.join(__dirname, '../', oldPath));
                }
                profilePhotoUrl = getPublicUrl(req.files.profilePhoto[0].path);
            }

            // Nouvelles images de galerie
            if (req.files.gallery) {
                // Supprimer les anciennes images de galerie
                page.gallery.forEach(imageUrl => {
                    if (imageUrl) {
                        const oldPath = imageUrl.replace('http://localhost:5000/', '');
                        deleteFile(path.join(__dirname, '../', oldPath));
                    }
                });
                // Ajouter les nouvelles images
                galleryUrls = req.files.gallery.map(file => getPublicUrl(file.path));
            }
        }

        // Mettre à jour les champs
        const updatedData = {
            ...(username && { username: username.trim() }),
            ...(newSlug && { slug: newSlug }),
            ...(title && { title: title.trim() }),
            ...(description !== undefined && { description: description?.trim() }),
            ...(theme && { theme }),
            ...(instagram !== undefined && { instagram: instagram?.trim() }),
            ...(phone !== undefined && { phone: phone?.trim() }),
            ...(email !== undefined && { email: email?.trim() }),
            ...(address !== undefined && { address: address?.trim() }),
            ...(website !== undefined && { website: website?.trim() }),
            ...(openingHours !== undefined && { openingHours: openingHours?.trim() }),
            ...(pricing !== undefined && { pricing: pricing?.trim() }),
            profilePhoto: profilePhotoUrl,
            gallery: galleryUrls,
            ...(settings && { settings: { ...page.settings, ...settings } })
        };

        const updatedPage = await PublicPage.findByIdAndUpdate(
            id, 
            updatedData, 
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

        res.json(updatedPage);
    } catch (error) {
        console.error('Erreur mise à jour page:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ 
                message: `Ce ${field === 'slug' ? 'nom d\'utilisateur' : field} est déjà utilisé` 
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }

        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// DELETE /api/public-pages/:id - Supprimer une page
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const page = await PublicPage.findById(id);
        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        await PublicPage.findByIdAndDelete(id);
        res.json({ message: 'Page supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression page:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET /api/public-pages - Lister toutes les pages actives (pour découverte)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, theme, search } = req.query;
        
        const query = { isActive: true };
        
        if (theme) {
            query.theme = theme;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const pages = await PublicPage.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('username slug title description theme profilePhoto views createdAt');

        const total = await PublicPage.countDocuments(query);

        res.json({
            pages,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Erreur récupération pages:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// PATCH /api/public-pages/:id/toggle-active - Activer/désactiver une page
router.patch('/:id/toggle-active', async (req, res) => {
    try {
        const { id } = req.params;

        const page = await PublicPage.findById(id);
        if (!page) {
            return res.status(404).json({ message: 'Page non trouvée' });
        }

        page.isActive = !page.isActive;
        await page.save();

        res.json({ 
            message: `Page ${page.isActive ? 'activée' : 'désactivée'} avec succès`,
            isActive: page.isActive 
        });
    } catch (error) {
        console.error('Erreur toggle page:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

module.exports = router;
