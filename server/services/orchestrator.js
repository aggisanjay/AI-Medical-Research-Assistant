const queryExpansionService = require('./queryExpansionService');
const openAlexService = require('./openAlexService');
const pubmedService = require('./pubmedService');
const clinicalTrialsService = require('./clinicalTrialsService');
const rankingService = require('./rankingService');
const llmService = require('./llmService');
const contextService = require('./contextService');
const ragService = require('./ragService');

class Orchestrator {
  _pushStep(workflowSteps, agent, startMs, metadata = {}) {
    workflowSteps.push({
      agent,
      status: 'completed',
      durationMs: Date.now() - startMs,
      metadata
    });
  }

  /**
   * Main pipeline: input → expand → retrieve → rank → reason → respond
   */
  async processQuery(input, conversationId, userId) {
    const startTime = Date.now();
    const workflowSteps = [];

    try {
      // ── Research Agent: context + expansion + retrieval ──
      const researchStart = Date.now();
      console.log('🔄 Step 1: Resolving context...');
      const resolvedInput = await contextService.resolveFollowUp(conversationId, input, userId);

      await contextService.addMessage(conversationId, {
        role: 'user',
        content: input.naturalQuery || input.query || `${input.disease} ${input.query}`.trim(),
        structuredInput: {
          patientName: resolvedInput.patientName,
          disease: resolvedInput.disease,
          query: resolvedInput.query,
          location: resolvedInput.location
        }
      }, userId);

      console.log('🔄 Step 2: Expanding query...');
      const expandedQuery = queryExpansionService.expand({
        disease: resolvedInput.disease,
        query: resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery,
        location: resolvedInput.location,
        naturalQuery: resolvedInput.enrichedQuery || resolvedInput.naturalQuery
      });
      console.log('   Expanded queries:', expandedQuery.expandedQueries.slice(0, 3));

      const isDocumentMode = input.responseMode === 'document';

      const documentIds = await contextService.resolveDocumentIds(
        conversationId,
        input.documentIds,
        userId
      );

      if (isDocumentMode && documentIds.length === 0) {
        throw new Error('Document Q&A mode requires at least one attached document.');
      }

      let openAlexPubs = [];
      let pubmedPubs = [];
      let trials = [];

      if (!isDocumentMode) {
        console.log('🔄 Step 3: Retrieving research data...');
        const [openAlexResults, pubmedResults, clinicalTrialResults] = await Promise.allSettled([
          openAlexService.fetchPublications(expandedQuery, { maxResults: 100 }),
          pubmedService.fetchPublications(expandedQuery, { maxResults: 100 }),
          clinicalTrialsService.fetchTrials(expandedQuery, { maxResults: 50 })
        ]);

        openAlexPubs = openAlexResults.status === 'fulfilled' ? openAlexResults.value : [];
        pubmedPubs = pubmedResults.status === 'fulfilled' ? pubmedResults.value : [];
        trials = clinicalTrialResults.status === 'fulfilled' ? clinicalTrialResults.value : [];
      } else {
        console.log('🔄 Step 3: Skipping external research data (Document Q&A mode)...');
      }

      const allPublications = [...openAlexPubs, ...pubmedPubs];
      const totalRetrieved = allPublications.length + trials.length;
      if (!isDocumentMode) {
        console.log(`   Total retrieved: ${allPublications.length} publications + ${trials.length} trials`);
      }

      const queryText =
        resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery || '';

      let documentChunks = [];
      if (documentIds.length > 0) {
        console.log(`🔄 Step 3b: Retrieving document context (${documentIds.length} docs)...`);
        documentChunks = await ragService.retrieve(queryText, userId, documentIds);
        console.log(`   Document chunks retrieved: ${documentChunks.length}`);
      }

      this._pushStep(workflowSteps, isDocumentMode ? 'Document Retrieval Agent' : 'Research Agent', researchStart, {
        isFollowUp: resolvedInput.isFollowUp || false,
        disease: resolvedInput.disease || null,
        queryExpansion: expandedQuery.expandedQueries.slice(0, 5),
        publicationsRetrieved: allPublications.length,
        trialsRetrieved: trials.length,
        totalRetrieved,
        documentsSearched: documentIds.length,
        documentChunksRetrieved: documentChunks.length,
        documentSources: documentChunks.slice(0, 3).map(c => ({
          filename: c.filename,
          score: c.score
        }))
      });

      // ── Evidence Agent: ranking + confidence ──
      const evidenceStart = Date.now();
      console.log('🔄 Step 4: Ranking and filtering...');
      const rankedPublications = isDocumentMode ? [] : rankingService.rankPublications(allPublications, expandedQuery, 8);
      const rankedTrials = isDocumentMode ? [] : rankingService.rankTrials(trials, expandedQuery, 6);

      const pubmedCount = rankedPublications.filter(p => p.source === 'PubMed').length;
      const openAlexCount = rankedPublications.filter(p => p.source === 'OpenAlex').length;
      
      if (!isDocumentMode) {
        console.log(`   After ranking: ${rankedPublications.length} publications (${pubmedCount} PubMed + ${openAlexCount} OpenAlex) + ${rankedTrials.length} trials`);
      } else {
        console.log('   Document Q&A mode: skipped ranking of external publications/trials');
      }

      const avgConfidence = rankedPublications.length > 0
        ? Math.round(
            rankedPublications.reduce((sum, p) => sum + (p.totalScore || 0), 0) / rankedPublications.length * 10
          ) / 10
        : 0;

      const avgDocumentRelevance =
        documentChunks.length > 0
          ? Math.round(
              (documentChunks.reduce((sum, c) => sum + c.score, 0) / documentChunks.length) * 100
            ) / 100
          : 0;

      this._pushStep(workflowSteps, isDocumentMode ? 'Document Evidence Agent' : 'Evidence Agent', evidenceStart, {
        publicationsReturned: rankedPublications.length,
        trialsReturned: rankedTrials.length,
        avgConfidence,
        avgDocumentRelevance,
        sources: {
          pubmed: pubmedCount,
          openAlex: openAlexCount,
          clinicalTrials: rankedTrials.length,
          uploadedDocuments: documentChunks.length
        },
        topScores: rankedPublications.slice(0, 3).map(p => ({
          title: (p.title || '').substring(0, 60),
          score: p.totalScore,
          source: p.source
        }))
      });

      // ── Summary Agent: LLM synthesis + citations ──
      const summaryStart = Date.now();
      console.log('🔄 Step 5: Generating LLM response...');
      const conversationHistory = await contextService.getHistoryForLLM(conversationId, 6, userId);

      const rawPromptResponse = await llmService.generateResponse({
        userQuery: resolvedInput.enrichedQuery || resolvedInput.query || resolvedInput.naturalQuery,
        disease: resolvedInput.disease,
        publications: rankedPublications,
        clinicalTrials: rankedTrials,
        documentChunks,
        conversationHistory,
        patientName: resolvedInput.patientName,
        responseMode: input.responseMode || 'standard'
      });

      let llmResponse = rawPromptResponse;
      let suggestedQuestions = [];
      const suggestionDelimiter = '### ✨ Suggested Follow-Up Questions';

      if (llmResponse.includes(suggestionDelimiter)) {
        const parts = llmResponse.split(suggestionDelimiter);
        llmResponse = parts[0].trim();
        const suggestionsText = parts[1];

        const lines = suggestionsText.split('\n');
        for (const line of lines) {
          const match = line.match(/^\d+\.\s+(.+)$/);
          if (match && match[1]) {
            suggestedQuestions.push(match[1].replace(/[*_~`]/g, '').trim());
          }
        }
      }

      this._pushStep(workflowSteps, 'Summary Agent', summaryStart, {
        citationsGenerated: rankedPublications.length + rankedTrials.length,
        publicationsCited: rankedPublications.length,
        trialsCited: rankedTrials.length,
        suggestedQuestions: suggestedQuestions.length,
        responseLength: llmResponse.length,
        responseMode: input.responseMode || 'standard'
      });

      const processingTime = Date.now() - startTime;
      console.log(`✅ Pipeline complete in ${processingTime}ms. Parsed ${suggestedQuestions.length} followup questions.`);

      await contextService.addMessage(conversationId, {
        role: 'assistant',
        content: llmResponse,
        responseMode: input.responseMode || 'standard',
        suggestedQuestions: suggestedQuestions,
        workflowSteps,
        documentChunks: documentChunks.map(c => ({
          filename: c.filename,
          score: c.score,
          excerpt: c.text.substring(0, 200)
        })),
        publications: rankedPublications.map(p => ({
          title: p.title,
          abstract: (p.abstract || '').substring(0, 500),
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
          documentChunksUsed: documentChunks.length,
          processingTimeMs: processingTime
        }
      }, userId);

      return {
        response: llmResponse,
        suggestedQuestions: suggestedQuestions,
        workflowSteps,
        documentChunks,
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
      if (workflowSteps.length > 0) {
        const last = workflowSteps[workflowSteps.length - 1];
        last.status = 'failed';
        last.metadata = { ...last.metadata, error: error.message };
      }
      throw error;
    }
  }
}

module.exports = new Orchestrator();
