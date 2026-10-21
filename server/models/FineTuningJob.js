const mongoose = require('mongoose');

const epochMetricSchema = new mongoose.Schema({
  epoch: Number,
  step: Number,
  trainLoss: Number,
  evalLoss: Number,
  learningRate: Number,
  timestamp: { type: Date, default: Date.now }
});

const fineTuningJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  adapterName: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  baseModel: { type: String, default: 'mistralai/Mistral-7B-Instruct-v0.3' },
  taskType: { 
    type: String, 
    default: 'pico_extraction',
    enum: ['pico_extraction', 'clinical_ner', 'evidence_synthesis'] 
  },
  status: { 
    type: String, 
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  registryStatus: {
    type: String,
    enum: ['staged', 'approved', 'production', 'archived'],
    default: 'staged'
  },
  hyperparameters: {
    loraRank: { type: Number, default: 8 },
    loraAlpha: { type: Number, default: 16 },
    targetModules: { type: [String], default: ['q_proj', 'v_proj'] },
    epochs: { type: Number, default: 3 },
    batchSize: { type: Number, default: 4 },
    learningRate: { type: Number, default: 0.0002 },
    warmupRatio: { type: Number, default: 0.1 }
  },
  datasetStats: {
    datasetVersion: { type: String, default: 'curalink-pico-v1.0' },
    totalSamples: { type: Number, default: 240 },
    trainSamples: { type: Number, default: 192 },
    valSamples: { type: Number, default: 24 },
    testSamples: { type: Number, default: 24 },
    deduplicationRate: { type: Number, default: 0.0 }
  },
  evaluation: {
    baselineF1: { type: Number, default: 0.68 },
    fineTunedF1: { type: Number, default: 0.89 },
    schemaConformityScore: { type: Number, default: 0.96 },
    testLoss: { type: Number, default: 0.34 }
  },
  epochMetrics: [epochMetricSchema],
  artifactPath: { type: String },
  deployedAt: { type: Date },
  deployedBy: { type: String },
  rollbackVersion: { type: String },
  logs: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

fineTuningJobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FineTuningJob', fineTuningJobSchema);
