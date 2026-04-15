/**
 * Ranking Service
 * Applies multi-factor scoring to retrieved publications and trials.
 * Implements: relevance scoring, recency weighting, credibility scoring.
 */

class RankingService {
  /**
   * Rank and filter publications
   * Input: broad pool (50-300)
   * Output: top K results
   */
  rankPublications(publications, query, topK = 8) {
    if (!publications.length) return [];

    const queryTerms = this._tokenize(query.primaryQuery);
    const diseaseTerms = this._tokenize(query.disease);
    const allTerms = [...new Set([...queryTerms, ...diseaseTerms])];

    const scored = publications.map(pub => {
      const score = this._scorePublication(pub, allTerms, queryTerms);
      return { ...pub, totalScore: score.total, scoreBreakdown: score };
    });

    // Sort by total score descending
    scored.sort((a, b) => b.totalScore - a.totalScore);

    // Return top K
    return scored.slice(0, topK);
  }

  /**
   * Rank and filter clinical trials
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

  _scorePublication(pub, allTerms, queryTerms) {
    let relevance = 0;
    let recency = 0;
    let credibility = 0;

    // --- Relevance Score (0-40) ---
    const titleLower = (pub.title || '').toLowerCase();
    const abstractLower = (pub.abstract || '').toLowerCase();
    const text = `${titleLower} ${abstractLower}`;

    // Title matches (weighted higher)
    let titleMatches = 0;
    for (const term of allTerms) {
      if (titleLower.includes(term)) titleMatches++;
    }
    relevance += Math.min((titleMatches / Math.max(allTerms.length, 1)) * 20, 20);

    // Abstract/body matches
    let bodyMatches = 0;
    for (const term of allTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      if (matches) bodyMatches += matches.length;
    }
    relevance += Math.min(bodyMatches * 1.5, 20);

    // --- Recency Score (0-25) ---
    const currentYear = new Date().getFullYear();
    const age = currentYear - (pub.year || 2000);
    if (age <= 1) recency = 25;
    else if (age <= 2) recency = 22;
    else if (age <= 3) recency = 18;
    else if (age <= 5) recency = 12;
    else if (age <= 8) recency = 6;
    else recency = 2;

    // --- Credibility Score (0-25) ---
    // Citation count
    const citations = pub.citationCount || 0;
    if (citations > 100) credibility += 12;
    else if (citations > 50) credibility += 10;
    else if (citations > 20) credibility += 8;
    else if (citations > 5) credibility += 5;
    else credibility += 2;

    // Has abstract
    if (pub.abstract && pub.abstract.length > 100) credibility += 5;

    // Source bonus
    if (pub.source === 'PubMed') credibility += 4;
    else if (pub.source === 'OpenAlex') credibility += 3;

    // Open access bonus
    if (pub.openAccess) credibility += 2;

    // Has authors
    if (pub.authors && pub.authors.length > 0) credibility += 2;

    // API relevance score (OpenAlex provides this)
    const apiRelevance = Math.min((pub.relevanceScore || 0) * 5, 10);

    const total = relevance + recency + credibility + apiRelevance;

    return { relevance, recency, credibility, apiRelevance, total };
  }

  _scoreTrial(trial, allTerms, location) {
    let relevance = 0;
    let statusScore = 0;
    let locationScore = 0;

    // --- Relevance (0-40) ---
    const text = `${trial.title} ${trial.briefTitle} ${trial.briefSummary}`.toLowerCase();
    for (const term of allTerms) {
      if (text.includes(term)) relevance += 8;
    }
    relevance = Math.min(relevance, 40);

    // --- Status Score (0-30) ---
    const status = (trial.status || '').toUpperCase();
    if (status === 'RECRUITING') statusScore = 30;
    else if (status === 'ACTIVE_NOT_RECRUITING' || status === 'ACTIVE, NOT YET RECRUITING') statusScore = 22;
    else if (status === 'NOT_YET_RECRUITING' || status === 'ENROLLING_BY_INVITATION') statusScore = 20;
    else if (status === 'COMPLETED') statusScore = 15;
    else statusScore = 5;

    // --- Location Score (0-20) ---
    if (location) {
      const locationsText = (trial.locations || []).join(' ').toLowerCase();
      if (locationsText.includes(location)) locationScore = 20;
      else {
        // Check partial match (city or country)
        const locationParts = location.split(/[,\s]+/).filter(p => p.length > 2);
        for (const part of locationParts) {
          if (locationsText.includes(part)) {
            locationScore = 12;
            break;
          }
        }
      }
    } else {
      locationScore = 10; // neutral if no location preference
    }

    // Phase bonus
    let phaseBonus = 0;
    const phase = (trial.phase || '').toLowerCase();
    if (phase.includes('3')) phaseBonus = 8;
    else if (phase.includes('2')) phaseBonus = 6;
    else if (phase.includes('4')) phaseBonus = 5;
    else if (phase.includes('1')) phaseBonus = 3;

    const total = relevance + statusScore + locationScore + phaseBonus;
    return { relevance, statusScore, locationScore, phaseBonus, total };
  }

  _tokenize(text) {
    if (!text) return [];
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'for', 'and', 'nor',
      'but', 'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'with',
      'by', 'from', 'as', 'into', 'about', 'latest', 'recent', 'new',
      'top', 'best', 'most', 'what', 'how', 'why', 'when', 'where'
    ]);

    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }
}

module.exports = new RankingService();
