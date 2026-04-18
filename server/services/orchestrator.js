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

      // Log source distribution
      const pubmedCount = rankedPublications.filter(p => p.source === 'PubMed').length;
      const openAlexCount = rankedPublications.filter(p => p.source === 'OpenAlex').length;
      console.log(`   After ranking: ${rankedPublications.length} publications (${pubmedCount} PubMed + ${openAlexCount} OpenAlex) + ${rankedTrials.length} trials`);

      // Step 5: LLM Reasoning
      console.log('🔄 Step 5: Generating LLM response...');
      const conversationHistory = await contextService.getHistoryForLLM(conversationId);

      const rawPromptResponse = await llmService.generateResponse({
        userQuery: resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery,
        disease: resolvedInput.disease,
        publications: rankedPublications,
        clinicalTrials: rankedTrials,
        conversationHistory,
        patientName: resolvedInput.patientName
      });

      // Parse out suggested follow up questions
      let llmResponse = rawPromptResponse;
      let suggestedQuestions = [];
      const suggestionDelimiter = '### ✨ Suggested Follow-Up Questions';
      
      if (llmResponse.includes(suggestionDelimiter)) {
        const parts = llmResponse.split(suggestionDelimiter);
        llmResponse = parts[0].trim();
        const suggestionsText = parts[1];
        
        // Extract lines starting with a number or bullet
        const lines = suggestionsText.split('\n');
        for (const line of lines) {
          const match = line.match(/^\d+\.\s+(.+)$/);
          if (match && match[1]) {
            // Remove markdown bolder/italic just in case
            suggestedQuestions.push(match[1].replace(/[*_~`]/g, '').trim());
          }
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Pipeline complete in ${processingTime}ms. Parsed ${suggestedQuestions.length} followup questions.`);

      // Save assistant response — include ALL required fields
      await contextService.addMessage(conversationId, {
        role: 'assistant',
        content: llmResponse,
        suggestedQuestions: suggestedQuestions,
        publications: rankedPublications.map(p => ({
          title: p.title,
          abstract: (p.abstract || '').substring(0, 500),  // Include more abstract
          authors: p.authors || [],
          year: p.year,
          source: p.source,
          url: p.url,
          relevanceScore: p.totalScore
        })),
        clinicalTrials: rankedTrials.map(t => ({
          title: t.briefTitle || t.title,
          briefTitle: t.briefTitle || t.title,
          status: t.status,
          phase: t.phase || 'N/A',
          eligibility: (t.eligibility || '').substring(0, 2000),
          location: (t.locations || []).join('; '),
          locations: t.locations || ['Not specified'],
          contact: t.contact || 'Not available',
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
        suggestedQuestions: suggestedQuestions,
        publications: rankedPublications.map(p => ({
          title: p.title,
          abstract: (p.abstract || '').substring(0, 500),
          authors: p.authors || [],
          year: p.year,
          source: p.source,
          url: p.url,
          totalScore: p.totalScore
        })),
        clinicalTrials: rankedTrials.map(t => ({
          title: t.title,
          briefTitle: t.briefTitle || t.title,
          status: t.status,
          phase: t.phase || 'N/A',
          eligibility: (t.eligibility || '').substring(0, 2000),
          location: (t.locations || []).join('; '),
          locations: t.locations || ['Not specified'],
          contact: t.contact || 'Not available',
          nctId: t.nctId,
          url: t.url
        })),
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
