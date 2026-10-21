const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/events', auditController.listEvents);
router.get('/verify', auditController.verifyChain);

module.exports = router;
