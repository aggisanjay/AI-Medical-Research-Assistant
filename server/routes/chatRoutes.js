const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireClerkAuth } = require('../middleware/clerkAuth');

router.use(requireClerkAuth);

// Send a message (structured or natural)
router.post('/message', chatController.sendMessage);

// Get conversation history
router.get('/conversation/:conversationId', chatController.getConversation);

// Get aggregated analytics metrics
router.get('/analytics', chatController.getAnalytics);

// Get all conversations (for sidebar)
router.get('/conversations', chatController.listConversations);

// Create new conversation
router.post('/conversation/new', chatController.newConversation);

// Delete conversation
router.delete('/conversation/:conversationId', chatController.deleteConversation);

module.exports = router;
