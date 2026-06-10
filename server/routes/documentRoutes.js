const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');
const { requireClerkAuth } = require('../middleware/clerkAuth');

router.use(requireClerkAuth);

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/', documentController.list);
router.get('/:documentId', documentController.getOne);
router.delete('/:documentId', documentController.remove);

module.exports = router;
