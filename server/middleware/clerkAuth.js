const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');

/**
 * Attaches Clerk auth context to every request.
 * Public routes (e.g. /api/health) skip requireAuth but still get auth when a token is present.
 */
const clerkAuthMiddleware = clerkMiddleware();

/**
 * Rejects unauthenticated requests with 401.
 */
const requireClerkAuth = requireAuth();

/**
 * Returns the authenticated Clerk user ID or null.
 */
function getUserId(req) {
  const { userId } = getAuth(req);
  return userId || null;
}

module.exports = {
  clerkAuthMiddleware,
  requireClerkAuth,
  getUserId,
};
