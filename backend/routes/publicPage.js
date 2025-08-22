const PublicPage = require('../models/PublicPage');

app.post('/api/public-page', async (req, res) => {
    try {
        if (req.user.role !== 'tatoueur') {
            return res.status(403).json({ message: "Accès réservé aux tatoueurs." });
        }

        const exist = await PublicPage.findOne({ tatoueur: req.user._id });
        if (exist) {
            return res.status(400).json({ message: "Vous avez déjà une page publique." });
        }

        const page = new PublicPage({
            tatoueur: req.user._id,
            titre: req.body.titre,
            bio: req.body.bio,
            portfolio: req.body.portfolio || [],
            dispo: req.body.dispo || {},
            reseaux_sociaux: req.body.reseaux_sociaux || {},
            url_slug: req.body.url_slug
        });

        await page.save();
        res.status(201).json({ message: "Page créée avec succès.", page });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur.", error: err.message });
    }
});

app.put('/api/public-page/:id', async (req, res) => {
    try {
        const page = await PublicPage.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ message: "Page introuvable." });
        }

        if (page.tatoueur.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Modification non autorisée." });
        }

        Object.assign(page, req.body, { updatedAt: Date.now() });
        await page.save();
        res.status(200).json({ message: "Page mise à jour avec succès.", page });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur.", error: err.message });
    }
});