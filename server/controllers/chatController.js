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
      const result = await orchestrator.processQuery(input, convId);

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
      const conversation = await Conversation.findOne({ conversationId });

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
      const conversations = await Conversation.find()
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('conversationId diseaseContext patientName updatedAt messages');

      const summaries = conversations.map(conv => ({
        conversationId: conv.conversationId,
        disease: conv.diseaseContext,
        patientName: conv.patientName,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
        lastMessage: conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1].content.substring(0, 80)
          : ''
      }));

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
      const conversationId = uuidv4();
      const conversation = new Conversation({
        conversationId,
        messages: []
      });
      await conversation.save();
      res.json({ success: true, conversationId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = chatController;
