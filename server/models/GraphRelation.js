const mongoose = require('mongoose');

const graphRelationSchema = new mongoose.Schema({
  relationId: { type: String, required: true, unique: true },
  fromEntityId: { type: String, required: true, index: true },
  toEntityId: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: [
      'INVESTIGATES',
      'USES_INTERVENTION',
      'COMPARES_WITH',
      'INCLUDES_POPULATION',
      'MEASURES_OUTCOME',
      'REPORTS_FINDING',
      'SUPPORTED_BY',
      'CONTRADICTED_BY',
      'AUTHORED_BY',
      'PUBLISHED_AS'
    ]
  },
  strength: { type: Number, default: 0.9 }, // 0 to 1
  evidenceSnippet: String,
  sourceId: String, // e.g. PMID or NCT ID
  sourceUrl: String,
  isContradiction: { type: Boolean, default: false },
  contradictionNotes: String,
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

graphRelationSchema.index({ fromEntityId: 1, toEntityId: 1, type: 1 });

module.exports = mongoose.model('GraphRelation', graphRelationSchema);
