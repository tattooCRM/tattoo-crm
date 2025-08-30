const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Routes pour les projets
router.get('/', projectController.getProjects);
router.get('/:projectId', projectController.getProject);
router.put('/:projectId', projectController.updateProject);
router.post('/:projectId/sessions', projectController.addSession);

module.exports = router;
