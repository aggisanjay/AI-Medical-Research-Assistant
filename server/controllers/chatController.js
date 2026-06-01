const { v4: uuidv4 } = require('uuid');
const orchestrator = require('../services/orchestrator');
const Conversation = require('../models/Conversation');

const chatController = {
  /**
   * Process a user message and return research-backed response
   */
  async sendMessage(req, res) {
    try {
      const {
        conversationId,
        message,
        patientName,
        disease,
        query,
        location,
        isStructured
      } = req.body;

      const userId = req.headers['x-user-id'] || 'anonymous';
      const convId = conversationId || uuidv4();

      // Build input object
      const input = isStructured
        ? {
            patientName: patientName || '',
            disease: disease || '',
            query: query || '',
            location: location || ''
          }
        : {
            naturalQuery: message || '',
            patientName: patientName || '',
            disease: disease || '',
            location: location || ''
          };

      // Process through the pipeline
      const result = await orchestrator.processQuery(input, convId, userId);

      res.json({
        success: true,
        conversationId: convId,
        data: result
      });

    } catch (error) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred processing your request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get conversation history
   */
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.headers['x-user-id'] || 'anonymous';
      const conversation = await Conversation.findOne({ conversationId, userId });

      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      res.json({ success: true, data: conversation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * List all conversations
   */
  async listConversations(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'anonymous';
      const conversations = await Conversation.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('conversationId diseaseContext patientName updatedAt messages');

      const summaries = conversations.map(conv => {
        const firstUserMsg = conv.messages.find(m => m.role === 'user');
        const defaultTitle = firstUserMsg 
          ? (firstUserMsg.content.length > 40 ? firstUserMsg.content.substring(0, 40) + '...' : firstUserMsg.content)
          : 'Untitled Investigation';

        return {
          conversationId: conv.conversationId,
          disease: conv.diseaseContext || conv.patientName || defaultTitle,
          patientName: conv.patientName,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages.length,
          lastMessage: conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1].content.substring(0, 80)
            : ''
        };
      });

      res.json({ success: true, data: summaries });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Create new conversation
   */
  async newConversation(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'anonymous';
      const conversationId = uuidv4();
      const conversation = new Conversation({
        conversationId,
        userId,
        messages: []
      });
      await conversation.save();
      res.json({ success: true, conversationId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Delete conversation
   */
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.headers['x-user-id'] || 'anonymous';
      const result = await Conversation.deleteOne({ conversationId, userId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = chatController;
