const mongoose = require('mongoose');

const tokenUsageSchema = new mongoose.Schema({
  query: { type: String, default: 'Medical Research Query' },
  conversationId: { type: String, index: true },
  userId: { type: String, default: 'anonymous', index: true },
  model: { type: String, default: 'qwen/qwen3.8-27b' },
  provider: { type: String, default: 'groq' },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  costUSD: { type: Number, default: 0.0 },
  costFormatted: { type: String, default: '$0.00000' },
  savingsUSD: { type: Number, default: 0.0 },
  savingsFormatted: { type: String, default: '$0.00000' },
  durationMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('TokenUsage', tokenUsageSchema);
