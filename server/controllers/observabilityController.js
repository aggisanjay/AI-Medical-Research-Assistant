const observabilityService = require('../services/observabilityService');

const observabilityController = {
  async getTelemetry(req, res) {
    try {
      const telemetry = await observabilityService.getSystemTelemetry();
      res.json({ success: true, telemetry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = observabilityController;
