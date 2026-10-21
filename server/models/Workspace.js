const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'lead_researcher', 'analyst', 'auditor'], 
    default: 'analyst' 
  },
  joinedAt: { type: Date, default: Date.now }
});

const workspaceSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  ownerId: { type: String, required: true },
  members: [memberSchema],
  settings: {
    enforceApprovalForExports: { type: Boolean, default: true },
    enforceApprovalForModelDeploy: { type: Boolean, default: true },
    allowedMCPTools: { type: [String], default: ['*'] },
    retentionDays: { type: Number, default: 365 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

workspaceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema);
