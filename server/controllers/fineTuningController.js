const fineTuningService = require('../services/fineTuningService');

const fineTuningController = {
  async listJobs(req, res) {
    try {
      const jobs = await fineTuningService.listJobs();
      res.json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getJob(req, res) {
    try {
      const { jobId } = req.params;
      const job = await fineTuningService.getJob(jobId);
      if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
      res.json({ success: true, data: job });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async startJob(req, res) {
    try {
      const { adapterName, baseModel, loraRank, loraAlpha, epochs, learningRate } = req.body;
      const job = await fineTuningService.startFineTuningJob({
        adapterName,
        baseModel,
        loraRank,
        loraAlpha,
        epochs,
        learningRate,
        userId: req.userId || 'user_researcher'
      });
      res.json({ success: true, data: job });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async promoteModel(req, res) {
    try {
      const { jobId, newStatus } = req.body;
      if (!jobId || !newStatus) {
        return res.status(400).json({ success: false, error: 'jobId and newStatus are required' });
      }
      const updated = await fineTuningService.updateRegistryStatus(jobId, newStatus, req.userId || 'user_lead');
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async rollback(req, res) {
    try {
      const result = await fineTuningService.rollbackProduction(req.userId || 'user_lead');
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = fineTuningController;
