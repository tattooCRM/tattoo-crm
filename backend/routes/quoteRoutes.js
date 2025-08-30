const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/auth');
const optionalAuthMiddleware = require('../middleware/optionalAuth');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes pour les devis
router.post('/', quoteController.createQuote);
router.get('/revenue', quoteController.getMonthlyRevenue);
router.get('/', quoteController.getQuotes);
router.get('/:id', quoteController.getQuote);
router.post('/:id/send', quoteController.sendQuote);
router.post('/:id/action', quoteController.handleQuoteAction);
router.post('/:id/accept', quoteController.acceptQuote);
router.post('/:id/reject', quoteController.rejectQuote);
router.get('/:id/view-pdf', quoteController.viewQuotePDF);
router.get('/:id/download-pdf', quoteController.downloadQuotePDF);

module.exports = router;
