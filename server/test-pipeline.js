const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const orchestrator = require('./services/orchestrator');
const { v4: uuidv4 } = require('uuid');

async function runTests() {
  await connectDB();
  console.log('\n🧪 ========= CURALINK PIPELINE TESTS =========\n');

  // Test 1: Structured Input
  console.log('━━━ TEST 1: Structured Input (Parkinson\'s + DBS) ━━━');
  try {
    const result1 = await orchestrator.processQuery({
      patientName: 'John Smith',
      disease: "Parkinson's disease",
      query: 'Deep Brain Stimulation',
      location: 'Toronto, Canada'
    }, uuidv4());

    console.log(`✅ Publications returned: ${result1.publications.length}`);
    console.log(`✅ Trials returned: ${result1.clinicalTrials.length}`);
    console.log(`✅ Total sources analyzed: ${result1.metadata.totalRetrieved}`);
    console.log(`✅ Processing time: ${result1.metadata.processingTimeMs}ms`);
    console.log(`✅ Response preview: ${result1.response.substring(0, 200)}...`);
    console.log();
  } catch (err) {
    console.error('❌ Test 1 failed:', err.message);
  }

  // Test 2: Natural Query
  console.log('━━━ TEST 2: Natural Query (Lung Cancer) ━━━');
  try {
    const result2 = await orchestrator.processQuery({
      naturalQuery: 'Latest treatment for lung cancer'
    }, uuidv4());

    console.log(`✅ Publications returned: ${result2.publications.length}`);
    console.log(`✅ Trials returned: ${result2.clinicalTrials.length}`);
    console.log(`✅ Disease detected: ${result2.metadata.disease}`);
    console.log(`✅ Processing time: ${result2.metadata.processingTimeMs}ms`);
    console.log();
  } catch (err) {
    console.error('❌ Test 2 failed:', err.message);
  }

  // Test 3: Follow-up Query
  console.log('━━━ TEST 3: Follow-up Query (Context Retention) ━━━');
  try {
    const convId = uuidv4();

    // First message
    await orchestrator.processQuery({
      naturalQuery: 'Latest treatment for lung cancer'
    }, convId);

    // Follow-up
    const result3 = await orchestrator.processQuery({
      naturalQuery: 'Can I take Vitamin D?'
    }, convId);

    console.log(`✅ Is follow-up: ${result3.metadata.isFollowUp}`);
    console.log(`✅ Context disease: ${result3.metadata.disease}`);
    console.log(`✅ Publications returned: ${result3.publications.length}`);
    console.log(`✅ Processing time: ${result3.metadata.processingTimeMs}ms`);
    console.log();
  } catch (err) {
    console.error('❌ Test 3 failed:', err.message);
  }

  // Test 4: Clinical Trials Focus
  console.log('━━━ TEST 4: Clinical Trials Query (Diabetes) ━━━');
  try {
    const result4 = await orchestrator.processQuery({
      naturalQuery: 'Clinical trials for diabetes'
    }, uuidv4());

    console.log(`✅ Trials returned: ${result4.clinicalTrials.length}`);
    if (result4.clinicalTrials.length > 0) {
      const trial = result4.clinicalTrials[0];
      console.log(`   First trial: ${trial.briefTitle || trial.title}`);
      console.log(`   Status: ${trial.status}`);
      console.log(`   NCT ID: ${trial.nctId}`);
    }
    console.log(`✅ Processing time: ${result4.metadata.processingTimeMs}ms`);
    console.log();
  } catch (err) {
    console.error('❌ Test 4 failed:', err.message);
  }

  console.log('🧪 ========= ALL TESTS COMPLETE =========\n');
  process.exit(0);
}

runTests().catch(console.error);
