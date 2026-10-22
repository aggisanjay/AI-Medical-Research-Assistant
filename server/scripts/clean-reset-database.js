const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Conversation = require('../models/Conversation');
const TokenUsage = require('../models/TokenUsage');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const EvaluationRun = require('../models/EvaluationRun');
const FineTuningJob = require('../models/FineTuningJob');
const Approval = require('../models/Approval');
const knowledgeGraphService = require('../services/knowledgeGraphService');

async function cleanReset() {
  console.log('🔄 Connecting to MongoDB for clean database reset...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  // 1. Wipe conversations
  const convRes = await Conversation.deleteMany({});
  console.log(`🗑️ Deleted ${convRes.deletedCount} conversations`);

  // 2. Wipe token usage
  const tokRes = await TokenUsage.deleteMany({});
  console.log(`🗑️ Deleted ${tokRes.deletedCount} TokenUsage ledger documents`);

  // 3. Wipe documents & chunks
  const docRes = await Document.deleteMany({});
  const chunkRes = await DocumentChunk.deleteMany({});
  console.log(`🗑️ Deleted ${docRes.deletedCount} documents and ${chunkRes.deletedCount} chunks`);

  // 5. Wipe evaluations & fine tuning jobs
  const evalRes = await EvaluationRun.deleteMany({});
  const ftRes = await FineTuningJob.deleteMany({});
  console.log(`🗑️ Deleted ${evalRes.deletedCount} evaluation runs and ${ftRes.deletedCount} fine-tuning jobs`);

  // 6. Ensure clean knowledge graph seed entities are ready
  await knowledgeGraphService.ensureSeedData();
  console.log('🌱 Knowledge graph seed entities verified & ready');

  console.log('\n✨ Database is now completely clean and ready for fresh end-to-end testing!');
  process.exit(0);
}

cleanReset().catch(err => {
  console.error('Reset error:', err);
  process.exit(1);
});
