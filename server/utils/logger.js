const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

// Sensitive keys to redact automatically
const REDACT_KEYS = [
  'password',
  'secret',
  'token',
  'apiKey',
  'authorization',
  'CLERK_SECRET_KEY',
  'HF_API_TOKEN',
  'OPENAI_API_KEY',
  'ssn',
  'creditCard'
];

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  redact: {
    paths: REDACT_KEYS.map(k => `*.${k}`).concat(REDACT_KEYS.map(k => `*.*.${k}`)),
    censor: '[REDACTED]'
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
