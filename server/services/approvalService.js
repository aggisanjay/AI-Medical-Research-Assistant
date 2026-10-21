const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Approval = require('../models/Approval');
const auditService = require('./auditService');
const logger = require('../utils/logger');

function computePayloadHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

class ApprovalService {
  /**
   * Request human approval for a restricted action
   */
  async requestApproval({
    workspaceId = 'default-workspace',
    actionType,
    title,
    description,
    riskLevel = 'high',
    payload,
    requestedBy,
    requestedByName = 'Lead Researcher',
    expiresInHours = 24
  }) {
    const approvalId = `appr-${uuidv4()}`;
    const payloadHash = computePayloadHash(payload);
    const idempotencyKey = `idemp-${uuidv4()}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    const approval = new Approval({
      approvalId,
      workspaceId,
      actionType,
      title,
      description,
      status: 'pending',
      riskLevel,
      payload,
      payloadHash,
      idempotencyKey,
      requestedBy,
      requestedByName,
      expiresAt
    });

    await approval.save();

    await auditService.recordEvent({
      workspaceId,
      actorId: requestedBy,
      actorRole: 'researcher',
      eventType: 'approval_request',
      severity: 'warning',
      resourceType: 'approval',
      resourceId: approvalId,
      action: `request_${actionType}`,
      details: { title, riskLevel, payloadHash }
    });

    logger.info({ approvalId, actionType, requestedBy }, 'Human approval requested');
    return approval;
  }

  /**
   * List approval requests with optional status filter
   */
  async listApprovals({ workspaceId, status, limit = 50 }) {
    const query = {};
    if (workspaceId) query.workspaceId = workspaceId;
    if (status) query.status = status;

    // Check and auto-mark expired items
    const now = new Date();
    await Approval.updateMany(
      { status: 'pending', expiresAt: { $lt: now } },
      { status: 'expired' }
    );

    return Approval.find(query).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Decide approval (approve or reject)
   */
  async decideApproval({
    approvalId,
    decision, // 'approved' | 'rejected'
    reviewerId,
    reviewerName = 'Lead Architect',
    reviewerRole = 'lead_researcher',
    rejectionReason
  }) {
    const approval = await Approval.findOne({ approvalId });
    if (!approval) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Cannot decide on approval with status: ${approval.status}`);
    }

    if (new Date() > approval.expiresAt) {
      approval.status = 'expired';
      await approval.save();
      throw new Error('Approval request has expired');
    }

    // Role check: Only lead_researcher or admin can approve high/critical actions
    if (['high', 'critical'].includes(approval.riskLevel) && !['lead_researcher', 'admin'].includes(reviewerRole)) {
      throw new Error('Insufficient permissions: Only Lead Researchers or Administrators can approve high-risk actions');
    }

    approval.status = decision;
    approval.reviewedBy = reviewerId;
    approval.reviewedByName = reviewerName;
    approval.reviewedAt = new Date();
    if (decision === 'rejected') {
      approval.rejectionReason = rejectionReason || 'Rejected by authorized reviewer';
    }

    await approval.save();

    await auditService.recordEvent({
      workspaceId: approval.workspaceId,
      actorId: reviewerId,
      actorRole: reviewerRole,
      eventType: 'approval_decision',
      severity: decision === 'approved' ? 'info' : 'warning',
      resourceType: 'approval',
      resourceId: approvalId,
      action: `approval_${decision}`,
      details: { decision, rejectionReason, riskLevel: approval.riskLevel }
    });

    return approval;
  }

  /**
   * Execute an approved action with revalidation and tamper detection
   */
  async executeApprovedAction(approvalId, executorUserId, executionFn) {
    const approval = await Approval.findOne({ approvalId });
    if (!approval) throw new Error('Approval not found');

    // Revalidation 1: Status must be 'approved'
    if (approval.status !== 'approved') {
      throw new Error(`Action cannot be executed. Current status: ${approval.status}`);
    }

    // Revalidation 2: Check expiration
    if (new Date() > approval.expiresAt) {
      approval.status = 'expired';
      await approval.save();
      throw new Error('Approved window has expired. A fresh approval request is required.');
    }

    // Revalidation 3: Tamper check - payload hash verification
    const currentHash = computePayloadHash(approval.payload);
    if (currentHash !== approval.payloadHash) {
      approval.status = 'execution_failed';
      approval.errorMessage = 'Tamper Detection Failure: Payload content modified after approval.';
      await approval.save();
      await auditService.recordEvent({
        workspaceId: approval.workspaceId,
        actorId: executorUserId,
        eventType: 'policy_decision',
        severity: 'critical',
        resourceType: 'approval',
        resourceId: approvalId,
        action: 'execution_tamper_blocked',
        details: { expectedHash: approval.payloadHash, detectedHash: currentHash }
      });
      throw new Error('Security Alert: Payload was modified post-approval. Execution blocked.');
    }

    approval.status = 'execution_in_progress';
    await approval.save();

    try {
      const result = executionFn ? await executionFn(approval.payload) : { message: 'Action executed successfully' };
      approval.status = 'executed';
      approval.executionResult = result;
      await approval.save();

      await auditService.recordEvent({
        workspaceId: approval.workspaceId,
        actorId: executorUserId,
        eventType: 'policy_decision',
        severity: 'info',
        resourceType: 'approval',
        resourceId: approvalId,
        action: 'action_executed',
        details: { actionType: approval.actionType }
      });

      return { success: true, result };
    } catch (err) {
      approval.status = 'execution_failed';
      approval.errorMessage = err.message;
      await approval.save();
      throw err;
    }
  }
}

module.exports = new ApprovalService();
