const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { clerkAuthMiddleware } = require('./middleware/clerkAuth');
const { guardrailsMiddleware } = require('./middleware/guardrails');

// Route imports
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const mcpRoutes = require('./routes/mcpRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const auditRoutes = require('./routes/auditRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const fineTuningRoutes = require('./routes/fineTuningRoutes');
const graphRoutes = require('./routes/graphRoutes');
const observabilityRoutes = require('./routes/observabilityRoutes');

// Services initialization
const knowledgeGraphService = require('./services/knowledgeGraphService');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(clerkAuthMiddleware);
app.use(guardrailsMiddleware);

// Connect to MongoDB & Seed Data
connectDB().then(() => {
  knowledgeGraphService.ensureSeedData().catch(err => {
    console.warn('Knowledge graph seeding notice:', err.message);
  });
});

// Mounted Routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/models', fineTuningRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/observability', observabilityRoutes);

// System Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Curalink Agentic AI Medical Research Platform',
    version: '2.0.0',
    capabilities: [
      'Multi-Agent Research & Automation',
      'Secure RAG with Guardrails',
      'Automated LLM Evaluation Pipeline',
      'AI Agent with Human Approval & Audit Logs',
      'Fine-tuned LoRA Clinical Extraction',
      'Knowledge Graph-Powered RAG',
      'MCP-Powered Tool Ecosystem'
    ],
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Curalink Unified Medical Research Server running on port ${PORT}`);
  });
}

module.exports = app;
