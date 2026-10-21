const Workspace = require('../models/Workspace');
const { getUserId } = require('./clerkAuth');

// Role hierarchy & capabilities
const ROLE_PERMISSIONS = {
  admin: ['*'],
  lead_researcher: [
    'read', 'write', 'execute_mcp', 'request_approval', 'approve_requests',
    'deploy_model', 'manage_graph', 'run_evaluation'
  ],
  analyst: [
    'read', 'write', 'execute_mcp_low_risk', 'request_approval', 'run_evaluation'
  ],
  auditor: [
    'read', 'view_audit_logs', 'view_approvals', 'view_evaluations'
  ]
};

/**
 * Resolves current user ID and workspace ID
 */
async function resolveContext(req, res, next) {
  try {
    let userId = getUserId(req);
    if (!userId) {
      // In development or when no clerk token is passed, provide a safe default researcher identity
      userId = req.headers['x-user-id'] || 'user_researcher_default';
    }
    req.userId = userId;

    let workspaceId = req.headers['x-workspace-id'] || req.query.workspaceId || req.body?.workspaceId || 'default-workspace';
    req.workspaceId = workspaceId;

    // Fetch or ensure default workspace exists
    let workspace = await Workspace.findOne({ workspaceId });
    if (!workspace) {
      workspace = new Workspace({
        workspaceId,
        name: 'Primary Oncology & Clinical Workspace',
        description: 'Main research workspace for active trials and biomedical literature synthesis',
        ownerId: userId,
        members: [
          { userId, role: 'lead_researcher' }
        ]
      });
      await workspace.save().catch(() => {}); // catch in case of race condition
    }

    const member = workspace?.members?.find(m => m.userId === userId);
    req.userRole = member ? member.role : 'lead_researcher';
    req.workspace = workspace;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Ensures user has required permission
 */
function requirePermission(action) {
  return (req, res, next) => {
    const role = req.userRole || 'analyst';
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (permissions.includes('*') || permissions.includes(action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${role}' does not possess required permission '${action}'.`
    });
  };
}

module.exports = {
  resolveContext,
  requirePermission,
  ROLE_PERMISSIONS
};
