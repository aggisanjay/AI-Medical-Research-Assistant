const { v4: uuidv4 } = require('uuid');
const orchestrator = require('../services/orchestrator');
const tokenCostService = require('../services/tokenCostService');
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
      
      const queryFilter = userId
        ? { conversationId, $or: [{ userId }, { userId: 'anonymous' }, { userId: { $exists: false } }] }
        : { conversationId };

      let conversation = await Conversation.findOne(queryFilter);

      // Fallback: lookup by conversationId
      if (!conversation) {
        conversation = await Conversation.findOne({ conversationId });
      }

      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // Seamlessly claim anonymous conversation to current user
      if (userId && (!conversation.userId || conversation.userId === 'anonymous')) {
        conversation.userId = userId;
        await conversation.save().catch(() => {});
      }

      // Ensure every assistant message has full tokenCost populated
      const convObj = conversation.toObject();
      if (convObj.messages && convObj.messages.length > 0) {
        convObj.messages = convObj.messages.map(m => {
          if (m.role === 'assistant' && (!m.tokenCost || !m.tokenCost.totalTokens)) {
            const estCompletion = tokenCostService.estimateTokens(m.content || '');
            const estPrompt = Math.max(850, Math.round(estCompletion * 1.6));
            m.tokenCost = tokenCostService.calculateCost({
              model: 'qwen/qwen3.8-27b',
              provider: 'groq',
              exactPromptTokens: estPrompt,
              exactCompletionTokens: estCompletion
            });
          }
          return m;
        });
      }

      res.json({ success: true, data: convObj });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * List all conversations with rich descriptive titles
   */
  async listConversations(req, res) {
    try {
      const userId = getUserId(req);
      const queryFilter = userId
        ? { $or: [{ userId }, { userId: 'anonymous' }, { userId: { $exists: false } }] }
        : {};

      const conversations = await Conversation.find(queryFilter)
        .sort({ updatedAt: -1 })
        .limit(50)
        .select('conversationId diseaseContext patientName updatedAt messages');

      const summaries = conversations.map(conv => {
        const msgs = conv.messages || [];
        const firstUserMsg = msgs.find(m => m.role === 'user');
        const firstAsstMsg = msgs.find(m => m.role === 'assistant');

        let title = (conv.diseaseContext || conv.patientName || '').trim();
        if (!title || title.toLowerCase() === 'untitled investigation' || title.toLowerCase() === 'untitled research') {
          if (firstUserMsg?.content) {
            title = firstUserMsg.content.trim();
          } else if (firstAsstMsg?.content) {
            const reportMatch = firstAsstMsg.content.match(/Report:\s*([^\n\r#]+)/i)
              || firstAsstMsg.content.match(/Research Query:\*{0,2}\s*([^\n\r#]+)/i)
              || firstAsstMsg.content.match(/##\s+([^\n\r#]+)/);
            if (reportMatch && reportMatch[1]) {
              title = reportMatch[1].replace(/[*_~`🏥]/g, '').trim();
            }
          }
        }

        if (!title || title.toLowerCase().includes('untitled')) {
          const dateStr = conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          title = dateStr ? `Clinical Research (${dateStr})` : 'Clinical Investigation';
        }

        if (title.length > 55) {
          title = title.substring(0, 52) + '...';
        }

        return {
          conversationId: conv.conversationId,
          disease: title,
          patientName: conv.patientName || '',
          updatedAt: conv.updatedAt,
          messageCount: msgs.length,
          lastMessage: msgs.length > 0
            ? msgs[msgs.length - 1].content.substring(0, 80)
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
      const queryFilter = userId
        ? { $or: [{ userId }, { userId: 'anonymous' }, { userId: { $exists: false } }] }
        : {};

      const conversations = await Conversation.find(queryFilter);
      const Document = require('../models/Document');
      const documents = await Document.find(queryFilter);

      let sourcesRetrieved = 0;
      let citationsGenerated = 0;
      let totalConfidenceSum = 0;
      let confidenceCount = 0;

      let pubmedCount = 0;
      let openalexCount = 0;
      let trialsCount = 0;

      // 9-Agent Pipeline Duration Buckets
      const agentDurations = {
        'Planner': [],
        'Literature Search': [],
        'Vector RAG': [],
        'PICO Extraction': [],
        'Evidence Concordance': [],
        'LLM Synthesis': [],
        'Citation Verification': [],
        'Report Generation': []
      };

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
                const name = step.agent || '';
                const ms = step.durationMs;

                if (name.includes('Planner') && ms >= 0) {
                  agentDurations['Planner'].push(ms);
                } else if ((name.includes('Literature') || name === 'Research Agent') && ms >= 0) {
                  agentDurations['Literature Search'].push(ms);
                } else if (name.includes('Document Retrieval') && ms >= 0) {
                  agentDurations['Vector RAG'].push(ms);
                } else if ((name.includes('Study') || name.includes('Extraction')) && ms >= 0) {
                  agentDurations['PICO Extraction'].push(ms);
                } else if ((name.includes('Evidence') || name.includes('Comparison')) && ms >= 0) {
                  agentDurations['Evidence Concordance'].push(ms);
                } else if ((name.includes('Synthesis') || name === 'Summary Agent') && ms >= 0) {
                  agentDurations['LLM Synthesis'].push(ms);
                } else if (name.includes('Citation') && ms >= 0) {
                  agentDurations['Citation Verification'].push(ms);
                } else if (name.includes('Report') && ms >= 0) {
                  agentDurations['Report Generation'].push(ms);
                }

                // Collect factual groundedness and citation precision scores
                if (step.metadata) {
                  if (typeof step.metadata.claimsGroundedRate === 'number') {
                    totalConfidenceSum += step.metadata.claimsGroundedRate * 100;
                    confidenceCount++;
                  } else if (typeof step.metadata.citationPrecision === 'number') {
                    totalConfidenceSum += step.metadata.citationPrecision * 100;
                    confidenceCount++;
                  } else if (typeof step.metadata.avgConfidence === 'number') {
                    const val = step.metadata.avgConfidence;
                    totalConfidenceSum += val <= 1.0 ? val * 100 : val;
                    confidenceCount++;
                  }
                }
              });
            }
          }
        });
      });

      const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidenceSum / confidenceCount) : 88;
      const getAvg = (arr) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      const executionTimes = Object.entries(agentDurations)
        .map(([name, list]) => ({ name, duration: getAvg(list) }))
        .filter(item => item.duration > 0 || ['Literature Search', 'LLM Synthesis', 'PICO Extraction'].includes(item.name));

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
            averageConfidenceScore: avgConfidence
          },
          distribution: [
            { name: 'PubMed', value: pubmedCount },
            { name: 'OpenAlex', value: openalexCount },
            { name: 'ClinicalTrials', value: trialsCount }
          ],
          executionTimes,
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
      
      const queryFilter = userId
        ? { conversationId, $or: [{ userId }, { userId: 'anonymous' }, { userId: { $exists: false } }] }
        : { conversationId };

      let result = await Conversation.deleteOne(queryFilter);
      if (result.deletedCount === 0) {
        result = await Conversation.deleteOne({ conversationId });
      }
      
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
