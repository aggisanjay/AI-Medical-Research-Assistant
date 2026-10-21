const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  approvalId: { type: String, required: true, unique: true },
  workspaceId: { type: String, default: 'default-workspace' },
  actionType: { 
    type: String, 
    required: true,
    enum: [
      'export_report', 
      'deploy_model_adapter', 
      'delete_document', 
      'execute_restricted_mcp_tool', 
      'change_workspace_policy'
    ] 
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: [
      'pending', 
      'approved', 
      'rejected', 
      'expired', 
      'cancelled', 
      'execution_in_progress', 
      'executed', 
      'execution_failed'
    ], 
    default: 'pending' 
  },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  payloadHash: { type: String, required: true },
  idempotencyKey: { type: String, required: true },
  requestedBy: { type: String, required: true },
  requestedByName: { type: String, default: 'Researcher' },
  reviewedBy: { type: String },
  reviewedByName: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  executionResult: { type: mongoose.Schema.Types.Mixed },
  errorMessage: { type: String },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour expiry default
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

approvalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Approval', approvalSchema);
