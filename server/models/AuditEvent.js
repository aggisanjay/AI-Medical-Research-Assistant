const mongoose = require('mongoose');
const crypto = require('crypto');

const auditEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now, index: true },
  workspaceId: { type: String, default: 'default-workspace', index: true },
  actorId: { type: String, required: true },
  actorRole: { type: String, default: 'researcher' },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'auth_failure',
      'agent_execution',
      'tool_invocation',
      'policy_decision',
      'approval_request',
      'approval_decision',
      'sensitive_data_access',
      'model_training',
      'model_deployment',
      'config_change',
      'workflow_failure',
      'document_ingestion',
      'document_deletion'
    ]
  },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  correlationId: { type: String },
  previousEventHash: { type: String, default: '0000000000000000' },
  eventHash: { type: String, required: true },
  hash: { type: String } // compatibility alias for legacy index
});

// Compute SHA-256 integrity hash before saving
auditEventSchema.statics.createSignedEvent = async function (eventData) {
  // Try dropping legacy stale index if it exists in remote mongo
  if (!this._droppedLegacyIndex) {
    this._droppedLegacyIndex = true;
    this.collection.dropIndex('hash_1').catch(() => {});
  }

  const lastEvent = await this.findOne().sort({ timestamp: -1 });
  const prevHash = lastEvent ? lastEvent.eventHash : '0000000000000000';
  
  const contentToHash = JSON.stringify({
    eventId: eventData.eventId,
    timestamp: eventData.timestamp || new Date(),
    workspaceId: eventData.workspaceId,
    actorId: eventData.actorId,
    eventType: eventData.eventType,
    resourceType: eventData.resourceType,
    resourceId: eventData.resourceId,
    action: eventData.action,
    details: eventData.details,
    previousEventHash: prevHash
  });

  const hash = crypto.createHash('sha256').update(contentToHash).digest('hex');

  const doc = new this({
    ...eventData,
    previousEventHash: prevHash,
    eventHash: hash,
    hash: hash
  });

  return doc.save();
};

module.exports = mongoose.model('AuditEvent', auditEventSchema);
