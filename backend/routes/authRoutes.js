const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Route temporaire pour mettre à jour un tatoueur avec slug
router.put('/update-artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, specialty, bio, isPublicPageActive = true } = req.body;
    
    const artist = await User.findOneAndUpdate(
      { _id: id, role: 'tattoo_artist' },
      { slug, specialty, bio, isPublicPageActive },
      { new: true }
    );
    
    if (!artist) {
      return res.status(404).json({ message: 'Tatoueur non trouvé' });
    }
    
    res.json(artist);
  } catch (error) {
    console.error('Erreur mise à jour tatoueur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
