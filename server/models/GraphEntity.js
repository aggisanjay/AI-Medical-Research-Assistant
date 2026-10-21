const mongoose = require('mongoose');

const graphEntitySchema = new mongoose.Schema({
  entityId: { type: String, required: true, unique: true },
  label: { type: String, required: true }, // e.g. "Pembrolizumab" or "Non-Small Cell Lung Cancer"
  type: { 
    type: String, 
    required: true,
    enum: [
      'Condition',
      'Intervention',
      'Medication',
      'BiologicalTarget',
      'Population',
      'ClinicalStudy',
      'ClinicalTrial',
      'Outcome',
      'Publication',
      'Author',
      'EvidencePassage',
      'Guideline',
      'AdverseEvent'
    ]
  },
  aliases: [String],
  description: String,
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  sourceProvenance: {
    sourceType: { type: String, enum: ['PubMed', 'ClinicalTrials', 'UploadedDoc', 'CuratedOntology'], default: 'PubMed' },
    sourceId: String,
    url: String
  },
  confidence: { type: Number, default: 0.95 },
  createdAt: { type: Date, default: Date.now }
});

graphEntitySchema.index({ label: 'text', aliases: 'text' });
graphEntitySchema.index({ type: 1 });

module.exports = mongoose.model('GraphEntity', graphEntitySchema);
