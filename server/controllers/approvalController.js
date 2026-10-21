const approvalService = require('../services/approvalService');

const approvalController = {
  async listApprovals(req, res) {
    try {
      const { status, limit } = req.query;
      const workspaceId = req.workspaceId || 'default-workspace';
      const approvals = await approvalService.listApprovals({
        workspaceId,
        status,
        limit: limit ? parseInt(limit, 10) : 50
      });
      res.json({ success: true, count: approvals.length, data: approvals });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async requestApproval(req, res) {
    try {
      const { actionType, title, description, riskLevel, payload, expiresInHours } = req.body;
      if (!actionType || !title || !payload) {
        return res.status(400).json({ success: false, error: 'actionType, title, and payload are required' });
      }

      const approval = await approvalService.requestApproval({
        workspaceId: req.workspaceId || 'default-workspace',
        actionType,
        title,
        description,
        riskLevel,
        payload,
        requestedBy: req.userId || 'user_researcher',
        expiresInHours
      });

      res.json({ success: true, data: approval });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async decideApproval(req, res) {
    try {
      const { approvalId } = req.params;
      const { decision, rejectionReason } = req.body;

      if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({ success: false, error: "decision must be 'approved' or 'rejected'" });
      }

      const result = await approvalService.decideApproval({
        approvalId,
        decision,
        reviewerId: req.userId || 'user_lead',
        reviewerRole: req.userRole || 'lead_researcher',
        rejectionReason
      });

      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async executeApproved(req, res) {
    try {
      const { approvalId } = req.params;
      const result = await approvalService.executeApprovedAction(
        approvalId,
        req.userId || 'user_lead',
        async (payload) => {
          return {
            executed: true,
            action: payload,
            timestamp: new Date().toISOString()
          };
        }
      );

      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = approvalController;
