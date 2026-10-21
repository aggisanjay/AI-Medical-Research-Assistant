const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { resolveContext, requirePermission } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/', approvalController.listApprovals);
router.post('/request', approvalController.requestApproval);
router.post('/:approvalId/decide', approvalController.decideApproval);
router.post('/:approvalId/execute', approvalController.executeApproved);

module.exports = router;
