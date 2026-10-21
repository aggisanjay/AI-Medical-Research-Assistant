const express = require('express');
const router = express.Router();
const fineTuningController = require('../controllers/fineTuningController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/jobs', fineTuningController.listJobs);
router.get('/jobs/:jobId', fineTuningController.getJob);
router.post('/jobs/start', fineTuningController.startJob);
router.post('/registry/promote', fineTuningController.promoteModel);
router.post('/registry/rollback', fineTuningController.rollback);

module.exports = router;
