const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  chunkId: { type: String, required: true, unique: true },
  documentId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  index: { type: Number, required: true },
  text: { type: String, required: true },
  tokenEstimate: { type: Number, default: 0 },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

documentChunkSchema.index({ userId: 1, documentId: 1, index: 1 });

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
