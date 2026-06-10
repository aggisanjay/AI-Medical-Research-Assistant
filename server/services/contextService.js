const Conversation = require('../models/Conversation');

class ContextService {
  /**
   * Get or create a conversation
   */
  async getConversation(conversationId, userId) {
    let conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        userId: userId || 'anonymous',
        messages: []
      });
      await conversation.save();
    } else if (
      userId &&
      conversation.userId !== userId &&
      conversation.userId !== 'anonymous'
    ) {
      const err = new Error('Conversation not found');
      err.statusCode = 404;
      throw err;
    } else if (userId && conversation.userId === 'anonymous') {
      conversation.userId = userId;
      await conversation.save();
    }
    return conversation;
  }

  /**
   * Add a message to the conversation
   */
  async addMessage(conversationId, message, userId) {
    const conversation = await this.getConversation(conversationId, userId);

    // Update disease context if provided
    if (message.structuredInput?.disease) {
      conversation.diseaseContext = message.structuredInput.disease;
    } else if (!conversation.diseaseContext && message.role === 'user') {
      const topic = message.content;
      conversation.diseaseContext = topic.length > 40 ? topic.substring(0, 40) + '...' : topic;
    }
    if (message.structuredInput?.patientName) {
      conversation.patientName = message.structuredInput.patientName;
    }
    if (message.structuredInput?.location) {
      conversation.locationContext = message.structuredInput.location;
    }

    conversation.messages.push(message);
    await conversation.save();
    return conversation;
  }

  /**
   * Get conversation context for follow-up queries
   * Returns disease, location, and recent history
   */
  async getContext(conversationId, userId) {
    const conversation = await this.getConversation(conversationId, userId);

    return {
      disease: conversation.diseaseContext || '',
      patientName: conversation.patientName || '',
      location: conversation.locationContext || '',
      recentMessages: conversation.messages.slice(-10)
    };
  }

  /**
   * Resolve a follow-up query using conversation context
   * Merges current query with previous context
   */
  async resolveFollowUp(conversationId, currentInput, userId) {
    const context = await this.getContext(conversationId, userId);
    
    const resolved = {
      disease: currentInput.disease || context.disease || '',
      query: currentInput.query || currentInput.naturalQuery || '',
      location: currentInput.location || context.location || '',
      patientName: currentInput.patientName || context.patientName || '',
      naturalQuery: currentInput.naturalQuery || '',
      isFollowUp: !currentInput.disease && !!context.disease
    };

    // If it's a follow-up, enrich the natural query with context
    if (resolved.isFollowUp && resolved.naturalQuery) {
      resolved.enrichedQuery = `${resolved.naturalQuery} in context of ${resolved.disease}`;
    }

    return resolved;
  }

  /**
   * Get conversation history formatted for LLM
   */
  async resolveDocumentIds(conversationId, documentIds, userId) {
    const conversation = await this.getConversation(conversationId, userId);
    if (documentIds !== undefined) {
      conversation.attachedDocumentIds = [...new Set(documentIds)];
      await conversation.save();
    }
    return conversation.attachedDocumentIds || [];
  }

  async getHistoryForLLM(conversationId, maxMessages = 6, userId) {
    const conversation = await this.getConversation(conversationId, userId);
    return conversation.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-maxMessages)
      .map(m => ({
        role: m.role,
        content: m.content
      }));
  }
}

module.exports = new ContextService();
