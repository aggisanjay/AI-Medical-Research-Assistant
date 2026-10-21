const { v4: uuidv4 } = require('uuid');
const AuditEvent = require('../models/AuditEvent');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Records a cryptographically chained append-only audit event
   */
  async recordEvent({
    workspaceId = 'default-workspace',
    actorId = 'system',
    actorRole = 'system',
    eventType,
    severity = 'info',
    resourceType,
    resourceId,
    action,
    details = {},
    ipAddress = '127.0.0.1',
    correlationId
  }) {
    try {
      const eventId = `audit-${uuidv4()}`;

      // Redact potential sensitive fields inside details
      const sanitizedDetails = { ...details };
      ['apiKey', 'token', 'password', 'ssn', 'secret'].forEach(k => {
        if (sanitizedDetails[k]) sanitizedDetails[k] = '[REDACTED]';
      });

      const event = await AuditEvent.createSignedEvent({
        eventId,
        workspaceId,
        actorId,
        actorRole,
        eventType,
        severity,
        resourceType,
        resourceId,
        action,
        details: sanitizedDetails,
        ipAddress,
        correlationId
      });

      logger.info({ eventId, eventType, action, actorId }, 'Audit event recorded');
      return event;
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to record audit event');
      return null;
    }
  }

  /**
   * List audit events with filtering
   */
  async listEvents({ workspaceId, eventType, severity, limit = 50, skip = 0 }) {
    const query = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (eventType) query.eventType = eventType;
    if (severity) query.severity = severity;

    const [events, total] = await Promise.all([
      AuditEvent.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditEvent.countDocuments(query)
    ]);

    return { events, total };
  }

  /**
   * Verify integrity of the audit log chain
   */
  async verifyChainIntegrity(limit = 100) {
    const events = await AuditEvent.find().sort({ timestamp: 1 }).limit(limit);
    let compromised = false;
    let checkedCount = 0;

    for (let i = 1; i < events.length; i++) {
      checkedCount++;
      const current = events[i];
      const prev = events[i - 1];

      if (current.previousEventHash !== prev.eventHash) {
        compromised = true;
        return {
          valid: false,
          compromisedAtEventId: current.eventId,
          checkedCount
        };
      }
    }

    return {
      valid: true,
      compromised: false,
      checkedCount: events.length
    };
  }
}

module.exports = new AuditService();
