const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  errorMessage: { type: String, default: '' },
  chunkCount: { type: Number, default: 0 },
  charCount: { type: Number, default: 0 },
  embeddingModel: { type: String, default: '' },
  embeddingDimensions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

documentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
