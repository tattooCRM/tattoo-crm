const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const clientController = require('../controllers/clientController');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Routes pour les clients
router.get('/', clientController.getClients);
router.get('/stats', clientController.getClientStats);
router.get('/:clientId', clientController.getClient);
router.post('/', clientController.createClient);
router.put('/:clientId', clientController.updateClient);
router.delete('/:clientId', clientController.deleteClient);

module.exports = router;
