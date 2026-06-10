const ragService = require('../services/ragService');
const { getUserId } = require('../middleware/clerkAuth');

const documentController = {
  async upload(req, res) {
    try {
      const userId = getUserId(req);
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const document = await ragService.ingestFile(req.file, userId);

      res.status(201).json({
        success: true,
        data: {
          documentId: document.documentId,
          filename: document.filename,
          mimeType: document.mimeType,
          status: document.status,
          chunkCount: document.chunkCount,
          charCount: document.charCount,
          embeddingModel: document.embeddingModel,
          embeddingDimensions: document.embeddingDimensions,
          createdAt: document.createdAt
        }
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to process document'
      });
    }
  },

  async list(req, res) {
    try {
      const userId = getUserId(req);
      const documents = await ragService.listDocuments(userId);
      res.json({ success: true, data: documents });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getOne(req, res) {
    try {
      const userId = getUserId(req);
      const document = await ragService.getDocument(req.params.documentId, userId);
      if (!document) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }
      res.json({ success: true, data: document });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const userId = getUserId(req);
      const deleted = await ragService.deleteDocument(req.params.documentId, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }
      res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = documentController;
