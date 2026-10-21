const auditService = require('../services/auditService');

const auditController = {
  async listEvents(req, res) {
    try {
      const { eventType, severity, limit, skip } = req.query;
      const workspaceId = req.workspaceId || 'default-workspace';
      const result = await auditService.listEvents({
        workspaceId,
        eventType,
        severity,
        limit: limit ? parseInt(limit, 10) : 50,
        skip: skip ? parseInt(skip, 10) : 0
      });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async verifyChain(req, res) {
    try {
      const result = await auditService.verifyChainIntegrity();
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = auditController;
