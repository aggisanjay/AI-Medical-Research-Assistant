const queryExpansionService = require('./queryExpansionService');
const openAlexService = require('./openAlexService');
const pubmedService = require('./pubmedService');
const clinicalTrialsService = require('./clinicalTrialsService');
const rankingService = require('./rankingService');
const llmService = require('./llmService');
const contextService = require('./contextService');

class Orchestrator {
  /**
   * Main pipeline: input → expand → retrieve → rank → reason → respond
   */
  async processQuery(input, conversationId) {
    const startTime = Date.now();

    try {
      // Step 1: Resolve context (follow-up handling)
      console.log('🔄 Step 1: Resolving context...');
      const resolvedInput = await contextService.resolveFollowUp(conversationId, input);

      // Save user message
      await contextService.addMessage(conversationId, {
        role: 'user',
        content: input.naturalQuery || input.query || `${input.disease} ${input.query}`.trim(),
        structuredInput: {
          patientName: resolvedInput.patientName,
          disease: resolvedInput.disease,
          query: resolvedInput.query,
          location: resolvedInput.location
        }
      });

      // Step 2: Query Expansion
      console.log('🔄 Step 2: Expanding query...');
      const expandedQuery = queryExpansionService.expand({
        disease: resolvedInput.disease,
        query: resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery,
        location: resolvedInput.location,
        naturalQuery: resolvedInput.enrichedQuery || resolvedInput.naturalQuery
      });
      console.log('   Expanded queries:', expandedQuery.expandedQueries.slice(0, 3));

      // Step 3: Parallel Retrieval (broad pool)
      console.log('🔄 Step 3: Retrieving research data...');
      const [openAlexResults, pubmedResults, clinicalTrialResults] = await Promise.allSettled([
        openAlexService.fetchPublications(expandedQuery, { maxResults: 100 }),
        pubmedService.fetchPublications(expandedQuery, { maxResults: 100 }),
        clinicalTrialsService.fetchTrials(expandedQuery, { maxResults: 50 })
      ]);

      const openAlexPubs = openAlexResults.status === 'fulfilled' ? openAlexResults.value : [];
      const pubmedPubs = pubmedResults.status === 'fulfilled' ? pubmedResults.value : [];
      const trials = clinicalTrialResults.status === 'fulfilled' ? clinicalTrialResults.value : [];

      // Merge publications
      const allPublications = [...openAlexPubs, ...pubmedPubs];
      const totalRetrieved = allPublications.length + trials.length;
      console.log(`   Total retrieved: ${allPublications.length} publications + ${trials.length} trials`);

      // Step 4: Ranking & Filtering
      console.log('🔄 Step 4: Ranking and filtering...');
      const rankedPublications = rankingService.rankPublications(allPublications, expandedQuery, 8);
      const rankedTrials = rankingService.rankTrials(trials, expandedQuery, 6);
      console.log(`   After ranking: ${rankedPublications.length} publications + ${rankedTrials.length} trials`);

      // Step 5: LLM Reasoning
      console.log('🔄 Step 5: Generating LLM response...');
      const conversationHistory = await contextService.getHistoryForLLM(conversationId);

      const llmResponse = await llmService.generateResponse({
        userQuery: resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery,
        disease: resolvedInput.disease,
        publications: rankedPublications,
        clinicalTrials: rankedTrials,
        conversationHistory,
        patientName: resolvedInput.patientName
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ Pipeline complete in ${processingTime}ms`);

      // Save assistant response
      await contextService.addMessage(conversationId, {
        role: 'assistant',
        content: llmResponse,
        publications: rankedPublications.map(p => ({
          title: p.title,
          abstract: (p.abstract || '').substring(0, 300),
          authors: p.authors,
          year: p.year,
          source: p.source,
          url: p.url,
          relevanceScore: p.totalScore
        })),
        clinicalTrials: rankedTrials.map(t => ({
          title: t.briefTitle || t.title,
          status: t.status,
          eligibility: (t.eligibility || '').substring(0, 200),
          location: (t.locations || []).join('; '),
          contact: t.contact,
          nctId: t.nctId,
          url: t.url
        })),
        metadata: {
          queryExpansion: expandedQuery.expandedQueries.slice(0, 5),
          totalRetrieved,
          processingTimeMs: processingTime
        }
      });

      return {
        response: llmResponse,
        publications: rankedPublications,
        clinicalTrials: rankedTrials,
        metadata: {
          queryExpansion: expandedQuery.expandedQueries.slice(0, 5),
          totalRetrieved,
          publicationsRetrieved: allPublications.length,
          trialsRetrieved: trials.length,
          publicationsReturned: rankedPublications.length,
          trialsReturned: rankedTrials.length,
          processingTimeMs: processingTime,
          disease: resolvedInput.disease,
          isFollowUp: resolvedInput.isFollowUp || false
        }
      };

    } catch (error) {
      console.error('❌ Orchestrator error:', error);
      throw error;
    }
  }
}

module.exports = new Orchestrator();
