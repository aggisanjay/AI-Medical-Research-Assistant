const evaluationService = require('../services/evaluationService');

const evaluationController = {
  async listRuns(req, res) {
    try {
      const runs = await evaluationService.listRuns();
      res.json({ success: true, count: runs.length, data: runs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async runBenchmark(req, res) {
    try {
      const { modelConfig } = req.body;
      const run = await evaluationService.runEvaluation({
        modelConfig,
        triggeredBy: req.userId || 'user_researcher'
      });
      res.json({ success: true, data: run });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async compareRuns(req, res) {
    try {
      const { runIdA, runIdB } = req.query;
      if (!runIdA || !runIdB) {
        return res.status(400).json({ success: false, error: 'runIdA and runIdB query parameters required' });
      }
      const comparison = await evaluationService.compareRuns(runIdA, runIdB);
      res.json({ success: true, data: comparison });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = evaluationController;
