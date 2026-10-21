const knowledgeGraphService = require('../services/knowledgeGraphService');

const graphController = {
  async searchEntities(req, res) {
    try {
      const { query, limit } = req.query;
      const entities = await knowledgeGraphService.searchEntities(query, limit ? parseInt(limit, 10) : 20);
      res.json({ success: true, count: entities.length, data: entities });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async traverse(req, res) {
    try {
      const { entityIds, maxDepth, limit } = req.body;
      if (!entityIds || !Array.isArray(entityIds)) {
        return res.status(400).json({ success: false, error: 'entityIds array is required' });
      }
      const subgraph = await knowledgeGraphService.traverseGraph(
        entityIds,
        maxDepth ? parseInt(maxDepth, 10) : 2,
        limit ? parseInt(limit, 10) : 30
      );
      res.json({ success: true, data: subgraph });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getContext(req, res) {
    try {
      const { query } = req.body;
      const context = await knowledgeGraphService.getGraphContextForQuery(query);
      res.json({ success: true, data: context });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = graphController;
