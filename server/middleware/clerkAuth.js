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
  try {
    if (typeof req.auth === 'function' || req.auth?.userId) {
      const authObj = typeof req.auth === 'function' ? req.auth() : req.auth;
      if (authObj?.userId) return authObj.userId;
    }
    const { userId } = getAuth(req);
    return userId || req.userId || null;
  } catch (err) {
    return req.userId || req.auth?.userId || null;
  }
}

module.exports = {
  clerkAuthMiddleware,
  requireClerkAuth,
  getUserId,
};
