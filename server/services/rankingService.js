/**
 * ============================================================
 *  CURALINK — Ranking & Re-Ranking Service
 * ============================================================
 *
 *  Multi-factor scoring system for publications and trials.
 *
 *  Scoring Model (Publications):
 *  ┌──────────────────┬────────────┐
 *  │ Factor           │ Max Points │
 *  ├──────────────────┼────────────┤
 *  │ Title Relevance  │ 25         │
 *  │ Abstract Match   │ 20         │
 *  │ Recency          │ 25         │
 *  │ Credibility      │ 20         │
 *  │ Source Diversity  │ 10         │
 *  └──────────────────┴────────────┘
 *
 *  Key Design Decision:
 *  - Source-balanced results (ensures PubMed + OpenAlex mix)
 *  - No single source dominates the final output
 *
 *  @module RankingService
 *  @version 2.0.0
 * ============================================================
 */

class RankingService {

  /**
   * Rank publications with SOURCE DIVERSITY guarantee.
   * 
   * Strategy:
   *   1. Score all publications equally (no source bias)
   *   2. Split into PubMed and OpenAlex pools
   *   3. Take top from EACH pool
   *   4. Merge and re-sort by score
   *   5. Return balanced top K
   *
   * @param {Array} publications - All retrieved publications
   * @param {Object} query - Expanded query object
   * @param {number} topK - Number of results to return (default 8)
   * @returns {Array} Ranked and source-balanced publications
   */
  rankPublications(publications, query, topK = 8) {
    if (!publications.length) return [];

    const queryTerms = this._tokenize(query.primaryQuery);
    const diseaseTerms = this._tokenize(query.disease);
    const allTerms = [...new Set([...queryTerms, ...diseaseTerms])];

    // Step 1: Score ALL publications equally
    const scored = publications.map(pub => {
      const score = this._scorePublication(pub, allTerms, queryTerms);
      return { ...pub, totalScore: score.total, scoreBreakdown: score };
    });

    // Step 2: Split by source
    const pubmedResults = scored
      .filter(p => p.source === 'PubMed')
      .sort((a, b) => b.totalScore - a.totalScore);

    const openAlexResults = scored
      .filter(p => p.source === 'OpenAlex')
      .sort((a, b) => b.totalScore - a.totalScore);

    console.log(`  📊 Ranking: ${pubmedResults.length} PubMed, ${openAlexResults.length} OpenAlex candidates`);

    // Step 3: Guarantee minimum from each source
    const minPerSource = Math.min(3, Math.floor(topK / 2));
    const balanced = [];

    // Take minimum from PubMed
    const pubmedTake = Math.min(minPerSource, pubmedResults.length);
    balanced.push(...pubmedResults.slice(0, pubmedTake));

    // Take minimum from OpenAlex
    const openAlexTake = Math.min(minPerSource, openAlexResults.length);
    balanced.push(...openAlexResults.slice(0, openAlexTake));

    // Step 4: Fill remaining slots from combined pool (best scores)
    const remaining = topK - balanced.length;
    if (remaining > 0) {
      const usedUrls = new Set(balanced.map(p => p.url));
      const combined = scored
        .filter(p => !usedUrls.has(p.url))
        .sort((a, b) => b.totalScore - a.totalScore);

      balanced.push(...combined.slice(0, remaining));
    }

    // Step 5: Final sort by score
    balanced.sort((a, b) => b.totalScore - a.totalScore);

    // Log source distribution
    const finalPubmed = balanced.filter(p => p.source === 'PubMed').length;
    const finalOpenAlex = balanced.filter(p => p.source === 'OpenAlex').length;
    console.log(`  📊 Final mix: ${finalPubmed} PubMed + ${finalOpenAlex} OpenAlex = ${balanced.length} total`);

    return balanced.slice(0, topK);
  }

  /**
   * Rank clinical trials with location and status weighting.
   *
   * @param {Array} trials - All retrieved trials
   * @param {Object} query - Expanded query
   * @param {number} topK - Number to return (default 6)
   * @returns {Array} Ranked trials
   */
  rankTrials(trials, query, topK = 6) {
    if (!trials.length) return [];

    const queryTerms = this._tokenize(query.primaryQuery);
    const diseaseTerms = this._tokenize(query.disease);
    const allTerms = [...new Set([...queryTerms, ...diseaseTerms])];
    const location = (query.location || '').toLowerCase();

    const scored = trials.map(trial => {
      const score = this._scoreTrial(trial, allTerms, location);
      return { ...trial, totalScore: score.total, scoreBreakdown: score };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    return scored.slice(0, topK);
  }

  // ─── Publication Scoring (Balanced) ───────────────────────

  /**
   * Score a publication on a 100-point scale.
   * 
   * IMPORTANT: No source-specific bonuses.
   * PubMed and OpenAlex are scored identically.
   *
   *   Title Relevance:  0-25 pts
   *   Abstract Match:   0-20 pts
   *   Recency:          0-25 pts
   *   Credibility:      0-20 pts
   *   Source Diversity:  0-10 pts (both sources get equal bonus)
   */
  _scorePublication(pub, allTerms, queryTerms) {
    let titleRelevance = 0;
    let abstractRelevance = 0;
    let recency = 0;
    let credibility = 0;
    let sourceBonus = 0;

    // ── Title Relevance (0-25) ──
    const titleLower = (pub.title || '').toLowerCase();
    let titleMatches = 0;
    for (const term of allTerms) {
      if (titleLower.includes(term)) titleMatches++;
    }
    titleRelevance = Math.min(
      (titleMatches / Math.max(allTerms.length, 1)) * 25,
      25
    );

    // ── Abstract Relevance (0-20) ──
    const abstractLower = (pub.abstract || '').toLowerCase();
    const fullText = `${titleLower} ${abstractLower}`;
    let bodyMatches = 0;
    for (const term of allTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const matches = fullText.match(regex);
      if (matches) bodyMatches += matches.length;
    }
    abstractRelevance = Math.min(bodyMatches * 1.5, 20);

    // ── Recency (0-25) ──
    const currentYear = new Date().getFullYear();
    const age = currentYear - (pub.year || 2000);
    if (age <= 0) recency = 25;
    else if (age === 1) recency = 23;
    else if (age === 2) recency = 20;
    else if (age <= 3) recency = 17;
    else if (age <= 5) recency = 12;
    else if (age <= 8) recency = 7;
    else recency = 3;

    // ── Credibility (0-20) — SOURCE-NEUTRAL ──
    // Has meaningful abstract
    if (pub.abstract && pub.abstract.length > 100) credibility += 6;
    else if (pub.abstract && pub.abstract.length > 50) credibility += 3;

    // Has authors listed
    if (pub.authors && pub.authors.length > 0) credibility += 4;

    // Citation count (normalized — don't over-reward)
    const citations = pub.citationCount || 0;
    if (citations > 100) credibility += 5;
    else if (citations > 20) credibility += 4;
    else if (citations > 5) credibility += 3;
    else if (citations > 0) credibility += 2;
    else credibility += 1; // PubMed gets 1 point even with no citation data

    // Has journal/source info
    if (pub.journal) credibility += 3;

    // Open access bonus
    if (pub.openAccess) credibility += 2;

    credibility = Math.min(credibility, 20);

    // ── Source Diversity Bonus (0-10) — EQUAL FOR BOTH ──
    // Both sources get the same bonus — no favoritism
    if (pub.source === 'PubMed') sourceBonus = 8;
    else if (pub.source === 'OpenAlex') sourceBonus = 8;
    else sourceBonus = 5;

    const total = titleRelevance + abstractRelevance + recency + credibility + sourceBonus;

    return {
      titleRelevance: Math.round(titleRelevance * 10) / 10,
      abstractRelevance: Math.round(abstractRelevance * 10) / 10,
      recency,
      credibility,
      sourceBonus,
      total: Math.round(total * 10) / 10
    };
  }

  // ─── Clinical Trial Scoring ───────────────────────────────

  /**
   * Score a clinical trial.
   *
   *   Relevance:   0-40 pts
   *   Status:      0-30 pts
   *   Location:    0-20 pts
   *   Phase:       0-10 pts
   */
  _scoreTrial(trial, allTerms, location) {
    let relevance = 0;
    let statusScore = 0;
    let locationScore = 0;
    let phaseBonus = 0;

    // ── Relevance (0-40) ──
    const text = `${trial.title || ''} ${trial.briefTitle || ''} ${trial.briefSummary || ''}`.toLowerCase();
    for (const term of allTerms) {
      if (text.includes(term)) relevance += 8;
    }
    relevance = Math.min(relevance, 40);

    // ── Status Score (0-30) ──
    const status = (trial.status || '').toUpperCase();
    if (status === 'RECRUITING') statusScore = 30;
    else if (status.includes('ACTIVE') && status.includes('NOT')) statusScore = 22;
    else if (status === 'NOT_YET_RECRUITING') statusScore = 20;
    else if (status === 'ENROLLING_BY_INVITATION') statusScore = 18;
    else if (status === 'COMPLETED') statusScore = 15;
    else statusScore = 5;

    // ── Location (0-20) ──
    if (location) {
      const locationsText = (trial.locations || []).join(' ').toLowerCase();
      if (locationsText.includes(location)) {
        locationScore = 20;
      } else {
        const parts = location.split(/[,\s]+/).filter(p => p.length > 2);
        for (const part of parts) {
          if (locationsText.includes(part.toLowerCase())) {
            locationScore = 12;
            break;
          }
        }
      }
    } else {
      locationScore = 10; // Neutral if no location preference
    }

    // ── Phase (0-10) ──
    const phase = (trial.phase || '').toLowerCase();
    if (phase.includes('3')) phaseBonus = 10;
    else if (phase.includes('2')) phaseBonus = 7;
    else if (phase.includes('4')) phaseBonus = 6;
    else if (phase.includes('1')) phaseBonus = 4;
    else phaseBonus = 2;

    const total = relevance + statusScore + locationScore + phaseBonus;

    return {
      relevance,
      statusScore,
      locationScore,
      phaseBonus,
      total: Math.round(total * 10) / 10
    };
  }

  // ─── Utilities ────────────────────────────────────────────

  /**
   * Tokenize text into meaningful search terms.
   * Removes stop words and short words.
   */
  _tokenize(text) {
    if (!text) return [];
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'for', 'and', 'nor',
      'but', 'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'with',
      'by', 'from', 'as', 'into', 'about', 'latest', 'recent', 'new',
      'top', 'best', 'most', 'what', 'how', 'why', 'when', 'where',
      'studies', 'study', 'research', 'researchers', 'clinical', 'trial',
      'trials', 'treatment', 'treatments'
    ]);

    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }
}

module.exports = new RankingService();
