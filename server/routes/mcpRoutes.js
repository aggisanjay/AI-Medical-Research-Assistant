const express = require('express');
const router = express.Router();
const mcpController = require('../controllers/mcpController');
const { resolveContext } = require('../middleware/rbac');

router.use(resolveContext);

router.get('/tools', mcpController.listTools);
router.get('/servers', mcpController.listServers);
router.post('/execute', mcpController.executeTool);

module.exports = router;
