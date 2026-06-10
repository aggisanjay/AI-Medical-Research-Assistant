const { v4: uuidv4 } = require('uuid');
const orchestrator = require('../services/orchestrator');
const Conversation = require('../models/Conversation');
const { getUserId } = require('../middleware/clerkAuth');

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
        isStructured,
        documentIds,
        responseMode
      } = req.body;

      const userId = getUserId(req);
      const convId = conversationId || uuidv4();

      // Build input object
      const input = isStructured
        ? {
            patientName: patientName || '',
            disease: disease || '',
            query: query || '',
            location: location || '',
            responseMode: responseMode || 'standard'
          }
        : {
            naturalQuery: message || '',
            patientName: patientName || '',
            disease: disease || '',
            location: location || '',
            responseMode: responseMode || 'standard'
          };

      if (documentIds?.length) {
        input.documentIds = documentIds;
      }

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
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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
   * Get aggregated research database analytics
   */
  async getAnalytics(req, res) {
    try {
      const userId = getUserId(req);
      const conversations = await Conversation.find({ userId });
      const Document = require('../models/Document');
      const documents = await Document.find({ userId });

      let sourcesRetrieved = 0;
      let citationsGenerated = 0;
      let totalConfidenceSum = 0;
      let confidenceCount = 0;

      let pubmedCount = 0;
      let openalexCount = 0;
      let trialsCount = 0;

      const researchDurations = [];
      const evidenceDurations = [];
      const summaryDurations = [];
      const publicationsByYear = {};

      conversations.forEach(conv => {
        conv.messages.forEach(msg => {
          if (msg.role === 'assistant') {
            const pubList = msg.publications || [];
            const trialList = msg.clinicalTrials || [];
            citationsGenerated += pubList.length + trialList.length;

            if (msg.metadata && typeof msg.metadata.totalRetrieved === 'number') {
              sourcesRetrieved += msg.metadata.totalRetrieved;
            } else {
              sourcesRetrieved += pubList.length + trialList.length;
            }

            pubList.forEach(pub => {
              if (pub.source === 'PubMed') pubmedCount++;
              else if (pub.source === 'OpenAlex') openalexCount++;
              
              if (pub.year) {
                publicationsByYear[pub.year] = (publicationsByYear[pub.year] || 0) + 1;
              }
            });
            trialsCount += trialList.length;

            if (msg.workflowSteps && Array.isArray(msg.workflowSteps)) {
              msg.workflowSteps.forEach(step => {
                const agentName = step.agent;
                if ((agentName === 'Research Agent' || agentName === 'Document Retrieval Agent') && step.durationMs >= 0) {
                  researchDurations.push(step.durationMs);
                } else if (agentName === 'Evidence Agent' || agentName === 'Document Evidence Agent') {
                  if (step.durationMs >= 0) evidenceDurations.push(step.durationMs);
                  if (step.metadata && typeof step.metadata.avgConfidence === 'number') {
                    totalConfidenceSum += step.metadata.avgConfidence;
                    confidenceCount++;
                  }
                } else if (agentName === 'Summary Agent' && step.durationMs >= 0) {
                  summaryDurations.push(step.durationMs);
                }
              });
            }
          }
        });
      });

      const avgConfidence = confidenceCount > 0 ? (totalConfidenceSum / confidenceCount) : 0;
      const getAvg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const timelineData = Object.entries(publicationsByYear)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);

      const currentYear = new Date().getFullYear();
      if (timelineData.length === 0) {
        for (let y = currentYear - 4; y <= currentYear; y++) {
          timelineData.push({ year: y, count: 0 });
        }
      }

      res.json({
        success: true,
        data: {
          metrics: {
            sourcesRetrieved,
            citationsGenerated,
            researchSessions: conversations.length,
            documentsUploaded: documents.length,
            averageConfidenceScore: Math.round(avgConfidence * 10) / 10
          },
          distribution: [
            { name: 'PubMed', value: pubmedCount },
            { name: 'OpenAlex', value: openalexCount },
            { name: 'ClinicalTrials', value: trialsCount }
          ],
          executionTimes: [
            { name: 'Research Agent', duration: Math.round(getAvg(researchDurations)) },
            { name: 'Evidence Agent', duration: Math.round(getAvg(evidenceDurations)) },
            { name: 'Summary Agent', duration: Math.round(getAvg(summaryDurations)) }
          ],
          timeline: timelineData
        }
      });
    } catch (error) {
      console.error('Analytics controller error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Delete conversation
   */
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = getUserId(req);
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
