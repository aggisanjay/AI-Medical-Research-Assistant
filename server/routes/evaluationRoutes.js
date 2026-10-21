const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/runs', evaluationController.listRuns);
router.post('/run', evaluationController.runBenchmark);
router.get('/compare', evaluationController.compareRuns);

module.exports = router;
