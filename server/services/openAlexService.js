const axios = require('axios');

class OpenAlexService {
  constructor() {
    this.baseUrl = 'https://api.openalex.org/works';
    this.email = 'research@curalink.io'; // polite pool
    this._rateLimitedUntil = 0;
  }

  /**
   * Fetch publications from OpenAlex
   * Retrieves a broad pool then returns all for ranking
   */
  async fetchPublications(expandedQuery, options = {}) {
    const { maxResults = 100, fromYear = 2018 } = options;
    const allResults = [];

    // Check if OpenAlex is currently cooling down from a 429
    if (Date.now() < this._rateLimitedUntil) {
      console.log('📚 OpenAlex: Temporary rate-limit cooldown active; skipping to rely on PubMed & Trials');
      return [];
    }

    try {
      // Strategy: Multiple queries for breadth, safely extracted
      const queries = (
        Array.isArray(expandedQuery?.expandedQueries)
          ? expandedQuery.expandedQueries.slice(0, 3)
          : typeof expandedQuery === 'string'
            ? [expandedQuery]
            : [expandedQuery?.primaryQuery || expandedQuery?.query || expandedQuery?.disease].filter(Boolean)
      );

      if (!queries.length && expandedQuery?.primaryQuery) {
        queries.push(expandedQuery.primaryQuery);
      }

      if (!queries.length) {
        return [];
      }

      const perQueryLimit = Math.ceil(maxResults / queries.length);

      for (const query of queries) {
        if (Date.now() < this._rateLimitedUntil) break;
        const pageResults = await this._fetchPage(query, Math.min(perQueryLimit, 50), fromYear);
        if (pageResults.length > 0) {
          allResults.push(...pageResults);
        }
      }

      // Deduplicate by DOI or title
      const seen = new Set();
      const deduplicated = allResults.filter(pub => {
        const key = pub.doi || (pub.title || '').toLowerCase().substring(0, 80);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log(`📚 OpenAlex: Retrieved ${deduplicated.length} unique publications`);
      return deduplicated;

    } catch (error) {
      console.error('OpenAlex fetch error:', error.message);
      return [];
    }
  }

  async _fetchPage(query, perPage, fromYear) {
    const url = `${this.baseUrl}`;
    const params = {
      search: query,
      'per-page': Math.min(perPage, 50),
      page: 1,
      sort: 'relevance_score:desc',
      filter: `from_publication_date:${fromYear}-01-01`,
      mailto: this.email
    };

    if (process.env.OPENALEX_API_KEY) {
      params.api_key = process.env.OPENALEX_API_KEY;
    }

    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': 'CuraLink/1.0 (mailto:research@curalink.io)'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.results) return [];

      return response.data.results.map(work => this._transformWork(work));
    } catch (err) {
      if (err.response?.status === 429) {
        // OpenAlex rate limit: cool down for 60 seconds
        this._rateLimitedUntil = Date.now() + 60000;
        console.warn('📚 OpenAlex: Anonymous search rate-limited by OpenAlex cluster (429). Falling back to PubMed.');
      } else {
        console.warn(`📚 OpenAlex fetch warning: ${err.message}`);
      }
      return [];
    }
  }

  _transformWork(work) {
    // Extract authors
    const authors = (work.authorships || [])
      .slice(0, 5)
      .map(a => a.author?.display_name)
      .filter(Boolean);

    // Extract abstract from inverted index
    let abstract = '';
    if (work.abstract_inverted_index) {
      const indexEntries = [];
      for (const [word, positions] of Object.entries(work.abstract_inverted_index)) {
        for (const pos of positions) {
          indexEntries.push({ word, pos });
        }
      }
      indexEntries.sort((a, b) => a.pos - b.pos);
      abstract = indexEntries.map(e => e.word).join(' ');
    }

    return {
      title: work.title || 'Untitled',
      abstract: abstract.substring(0, 1000),
      authors,
      year: work.publication_year,
      source: 'OpenAlex',
      url: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
      doi: work.doi,
      citationCount: work.cited_by_count || 0,
      journal: work.primary_location?.source?.display_name || '',
      concepts: (work.concepts || []).slice(0, 5).map(c => c.display_name),
      relevanceScore: work.relevance_score || 0,
      openAccess: work.open_access?.is_oa || false
    };
  }
}

module.exports = new OpenAlexService();
