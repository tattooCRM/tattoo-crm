const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// 🌍 Route publique pour les demandes de projet (sans authentification)
router.post('/conversations/public', upload.single('placementPhoto'), chatController.createPublicConversation);

// Middleware d'authentification pour toutes les autres routes de chat
router.use(authMiddleware);

// 📥 Routes pour les conversations
router.get('/conversations', chatController.getUserConversations);
router.post('/conversations', upload.single('placementPhoto'), chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', chatController.getConversationMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.put('/conversations/:conversationId/read', chatController.markConversationAsRead);

// 🎨 Routes pour les tatoueurs disponibles
router.get('/tattoo-artists', chatController.getTattooArtists);

// 🔔 Statistiques de messages non lus
router.get('/unread-count', chatController.getUnreadCount);

module.exports = router;
