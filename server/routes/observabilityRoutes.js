const express = require('express');
const router = express.Router();
const observabilityController = require('../controllers/observabilityController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/telemetry', observabilityController.getTelemetry);

module.exports = router;
