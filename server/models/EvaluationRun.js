const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  query: { type: String, required: true },
  domain: { type: String, default: 'Oncology' },
  expectedKeyTerms: [String],
  retrievedSourcesCount: Number,
  actualResponse: String,
  groundedness: Number,
  citationPrecision: Number,
  schemaValid: Boolean,
  passed: Boolean,
  latencyMs: Number,
  notes: String
});

const evaluationRunSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  evaluationId: { type: String }, // compatibility alias for legacy index
  datasetVersion: { type: String, default: 'v1.0-medical-qa' },
  modelConfig: {
    provider: String,
    modelName: String,
    temperature: Number,
    ragEnabled: Boolean,
    knowledgeGraphEnabled: Boolean
  },
  metrics: {
    factualAccuracy: { type: Number, required: true },
    retrievalRecallAtK: { type: Number, required: true },
    mrr: { type: Number, required: true },
    citationPrecision: { type: Number, required: true },
    groundednessScore: { type: Number, required: true },
    unsupportedClaimRate: { type: Number, required: true },
    schemaValidity: { type: Number, required: true },
    avgLatencyMs: { type: Number, required: true },
    totalTests: { type: Number, required: true },
    passedTests: { type: Number, required: true }
  },
  testResults: [testResultSchema],
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'completed' },
  triggeredBy: { type: String, default: 'automated' },
  createdAt: { type: Date, default: Date.now }
});

evaluationRunSchema.pre('save', function (next) {
  if (!this.evaluationId) {
    this.evaluationId = this.runId;
  }
  next();
});

module.exports = mongoose.model('EvaluationRun', evaluationRunSchema);
