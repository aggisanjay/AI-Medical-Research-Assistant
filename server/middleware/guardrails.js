const logger = require('../utils/logger');

// Common prompt injection heuristics
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+DAN\s+mode/i,
  /reveal\s+(your|the)\s+(secret|system\s+prompt|api\s+key)/i,
  /output\s+all\s+(passwords|environment\s+variables|tokens)/i,
  /bypass\s+(guardrails|security|restrictions|filters)/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /\bjavascript\s*:/i
];

// PII/PHI redaction patterns
const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
  { pattern: /\b(?:MRN|mrn)[-:\s#]*\d{6,10}\b/gi, replacement: '[REDACTED_MRN]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { pattern: /\b(?:DOB|dob|Birth Date)[-:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi, replacement: '[REDACTED_DOB]' }
];

/**
 * Checks if input text contains potential prompt injections
 */
function detectPromptInjection(text) {
  if (!text || typeof text !== 'string') return { isSafe: true };

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSafe: false,
        reason: 'Potential prompt injection or instruction override detected',
        matchedPattern: pattern.toString()
      };
    }
  }

  return { isSafe: true };
}

/**
 * Redacts PII/PHI from given text
 */
function redactSensitiveData(text) {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

/**
 * Express middleware for request guardrails
 */
function guardrailsMiddleware(req, res, next) {
  // Check request body for injection attempts
  const checkPayload = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        const check = detectPromptInjection(val);
        if (!check.isSafe) return check;
        // Auto-scrub PII in-place
        obj[key] = redactSensitiveData(val);
      } else if (typeof val === 'object' && val !== null) {
        const nestedCheck = checkPayload(val);
        if (nestedCheck) return nestedCheck;
      }
    }
    return null;
  };

  if (req.body) {
    const violation = checkPayload(req.body);
    if (violation) {
      logger.warn({ path: req.path, violation }, 'Guardrails rejected input');
      return res.status(400).json({
        success: false,
        error: 'Security Guardrail Alert: Input contains prohibited prompt injection or unauthorized instruction patterns.',
        details: violation.reason
      });
    }
  }

  next();
}

module.exports = {
  detectPromptInjection,
  redactSensitiveData,
  guardrailsMiddleware
};
