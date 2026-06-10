const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const documentParserService = require('./documentParserService');
const chunkingService = require('./chunkingService');
const embeddingService = require('./embeddingService');

const DEFAULT_TOP_K = 5;
const MIN_SIMILARITY = 0.15;

class RagService {
  async ingestFile(file, userId) {
    const documentId = uuidv4();
    const doc = new Document({
      documentId,
      userId,
      filename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      status: 'processing',
      embeddingModel: embeddingService.modelName,
      embeddingDimensions: embeddingService.dimensions
    });
    await doc.save();

    try {
      const text = await documentParserService.parse(file);
      const chunks = chunkingService.chunk(text);

      if (chunks.length === 0) {
        throw new Error('No content could be extracted from document');
      }

      const embeddings = await embeddingService.embedBatch(chunks);
      const chunkDocs = chunks.map((chunkText, index) => ({
        chunkId: uuidv4(),
        documentId,
        userId,
        index,
        text: chunkText,
        tokenEstimate: chunkingService.estimateTokens(chunkText),
        embedding: embeddings[index]
      }));

      await DocumentChunk.insertMany(chunkDocs);

      doc.status = 'ready';
      doc.chunkCount = chunks.length;
      doc.charCount = text.length;
      await doc.save();

      return doc;
    } catch (error) {
      doc.status = 'failed';
      doc.errorMessage = error.message;
      await doc.save();
      throw error;
    }
  }

  async listDocuments(userId) {
    return Document.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  async getDocument(documentId, userId) {
    return Document.findOne({ documentId, userId });
  }

  async deleteDocument(documentId, userId) {
    const result = await Document.deleteOne({ documentId, userId });
    if (result.deletedCount === 0) return false;
    await DocumentChunk.deleteMany({ documentId, userId });
    return true;
  }

  /**
   * Retrieve top-k chunks by cosine similarity.
   * Scoped to userId + documentIds. Returns ranked chunks with scores.
   */
  async retrieve(query, userId, documentIds, topK = DEFAULT_TOP_K) {
    if (!documentIds?.length || !query?.trim()) {
      return [];
    }

    const readyDocs = await Document.find({
      userId,
      documentId: { $in: documentIds },
      status: 'ready'
    });

    if (readyDocs.length === 0) return [];

    const validIds = readyDocs.map(d => d.documentId);
    const chunks = await DocumentChunk.find({
      userId,
      documentId: { $in: validIds }
    });

    if (chunks.length === 0) return [];

    const queryEmbedding = await embeddingService.embed(query);
    const docMap = Object.fromEntries(readyDocs.map(d => [d.documentId, d]));

    const scored = chunks
      .map(chunk => {
        const score = embeddingService.cosineSimilarity(queryEmbedding, chunk.embedding);
        return {
          chunkId: chunk.chunkId,
          documentId: chunk.documentId,
          filename: docMap[chunk.documentId]?.filename || 'Unknown',
          index: chunk.index,
          text: chunk.text,
          score: Math.round(score * 1000) / 1000
        };
      })
      .filter(c => c.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }
}

module.exports = new RagService();
