const Conversation = require('../models/Conversation');

class ContextService {
  /**
   * Get or create a conversation
   */
  async getConversation(conversationId) {
    let conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        messages: []
      });
      await conversation.save();
    }
    return conversation;
  }

  /**
   * Add a message to the conversation
   */
  async addMessage(conversationId, message) {
    const conversation = await this.getConversation(conversationId);

    // Update disease context if provided
    if (message.structuredInput?.disease) {
      conversation.diseaseContext = message.structuredInput.disease;
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
  async getContext(conversationId) {
    const conversation = await this.getConversation(conversationId);

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
  async resolveFollowUp(conversationId, currentInput) {
    const context = await this.getContext(conversationId);
    
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
  async getHistoryForLLM(conversationId, maxMessages = 6) {
    const conversation = await this.getConversation(conversationId);
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
