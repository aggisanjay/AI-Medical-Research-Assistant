const axios = require('axios');

class OpenAlexService {
  constructor() {
    this.baseUrl = 'https://api.openalex.org/works';
    this.email = 'curalink@research.ai'; // polite pool
  }

  /**
   * Fetch publications from OpenAlex
   * Retrieves a broad pool then returns all for ranking
   */
  async fetchPublications(expandedQuery, options = {}) {
    const { maxResults = 100, fromYear = 2018 } = options;
    const allResults = [];

    try {
      // Strategy: Multiple queries for breadth
      const queries = expandedQuery.expandedQueries.slice(0, 4);
      if (!queries.length) queries.push(expandedQuery.primaryQuery);

      const perQueryLimit = Math.ceil(maxResults / queries.length);

      const fetchPromises = queries.map(query =>
        this._fetchPage(query, Math.min(perQueryLimit, 200), fromYear)
      );

      const results = await Promise.allSettled(fetchPromises);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value);
        }
      }

      // Deduplicate by DOI or title
      const seen = new Set();
      const deduplicated = allResults.filter(pub => {
        const key = pub.doi || pub.title.toLowerCase().substring(0, 80);
        if (seen.has(key)) return false;
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
      'per-page': Math.min(perPage, 200),
      page: 1,
      sort: 'relevance_score:desc',
      filter: `from_publication_date:${fromYear}-01-01`,
      mailto: this.email
    };

    const response = await axios.get(url, { params, timeout: 15000 });

    if (!response.data || !response.data.results) return [];

    return response.data.results.map(work => this._transformWork(work));
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
