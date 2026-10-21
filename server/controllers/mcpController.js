const mcpGateway = require('../services/mcpGateway');

const mcpController = {
  listTools(req, res) {
    try {
      const tools = mcpGateway.listTools();
      res.json({ success: true, count: tools.length, tools });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  listServers(req, res) {
    try {
      const servers = mcpGateway.listServers();
      res.json({ success: true, count: servers.length, servers });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async executeTool(req, res) {
    try {
      const { toolName, args, approvalId } = req.body;
      if (!toolName) {
        return res.status(400).json({ success: false, error: 'toolName is required' });
      }

      const result = await mcpGateway.executeTool(toolName, args || {}, {
        userId: req.userId || 'user_researcher',
        workspaceId: req.workspaceId || 'default-workspace',
        approvalId
      });

      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = mcpController;
