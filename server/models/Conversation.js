const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  structuredInput: {
    patientName: String,
    disease: String,
    query: String,
    location: String
  },
  publications: [{
    title: String,
    abstract: String,
    authors: [String],
    year: Number,
    source: String,
    url: String,
    relevanceScore: Number
  }],
  clinicalTrials: [{
    title: String,
    briefTitle: String,
    status: String,
    phase: String,
    eligibility: String,
    location: String,           // Keep for backward compatibility
    locations: [String],        // ← ADD THIS (array of locations)
    contact: String,
    nctId: String,
    url: String
  }],
  metadata: {
    queryExpansion: [String],
    totalRetrieved: Number,
    processingTimeMs: Number
  },
  suggestedQuestions: [String],
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  userId: { type: String, default: 'anonymous' },
  diseaseContext: { type: String, default: '' },
  patientName: { type: String, default: '' },
  locationContext: { type: String, default: '' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
