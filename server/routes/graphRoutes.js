const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/entities', graphController.searchEntities);
router.post('/traverse', graphController.traverse);
router.post('/context', graphController.getContext);

module.exports = router;
