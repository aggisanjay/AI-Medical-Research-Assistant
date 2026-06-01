const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class PubmedService {
  constructor() {
    this.searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    this.fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  /**
   * Two-step process: search for IDs, then fetch details
   */
  async fetchPublications(expandedQuery, options = {}) {
    const { maxResults = 100 } = options;

    try {
      // Step 1: Search for PMIDs using multiple query variants
      const queries = [
        expandedQuery.pubmedQuery,
        expandedQuery.primaryQuery
      ].filter(Boolean);

      let allIds = new Set();

      for (const query of queries) {
        const ids = await this._searchIds(query, Math.ceil(maxResults / queries.length));
        ids.forEach(id => allIds.add(id));
        if (allIds.size >= maxResults) break;
      }

      const pmids = [...allIds].slice(0, maxResults);

      if (pmids.length === 0) {
        console.log('📄 PubMed: No results found');
        return [];
      }

      // Step 2: Fetch details in batches
      const publications = await this._fetchDetails(pmids);
      console.log(`📄 PubMed: Retrieved ${publications.length} publications`);
      return publications;

    } catch (error) {
      console.error('PubMed fetch error:', error.message);
      return [];
    }
  }

  async _searchIds(query, retMax) {
    const params = {
      db: 'pubmed',
      term: query,
      retmax: Math.min(retMax, 200),
      sort: 'pub+date',
      retmode: 'json'
    };

    const response = await axios.get(this.searchUrl, { params, timeout: 10000 });
    return response.data?.esearchresult?.idlist || [];
  }

  async _fetchDetails(pmids) {
    const batchSize = 50;
    const allPublications = [];

    for (let i = 0; i < pmids.length; i += batchSize) {
      const batch = pmids.slice(i, i + batchSize);
      try {
        const response = await axios.get(this.fetchUrl, {
          params: {
            db: 'pubmed',
            id: batch.join(','),
            retmode: 'xml'
          },
          timeout: 15000
        });

        const articles = this._parseXml(response.data);
        allPublications.push(...articles);
      } catch (error) {
        console.error(`PubMed batch fetch error: ${error.message}`);
      }
    }

    return allPublications;
  }

  _parseXml(xmlData) {
    try {
      const parsed = this.xmlParser.parse(xmlData);
      const articles = parsed?.PubmedArticleSet?.PubmedArticle;

      if (!articles) return [];

      const articleArray = Array.isArray(articles) ? articles : [articles];

      return articleArray.map(article => this._transformArticle(article)).filter(Boolean);
    } catch (error) {
      console.error('PubMed XML parse error:', error.message);
      return [];
    }
  }

  _transformArticle(article) {
    try {
      const medlineCitation = article.MedlineCitation;
      const articleData = medlineCitation?.Article;

      if (!articleData) return null;

      // Title
      const title = typeof articleData.ArticleTitle === 'string'
        ? articleData.ArticleTitle
        : articleData.ArticleTitle?.['#text'] || 'Untitled';

      // Abstract
      let abstract = '';
      const abstractData = articleData.Abstract?.AbstractText;
      if (typeof abstractData === 'string') {
        abstract = abstractData;
      } else if (Array.isArray(abstractData)) {
        abstract = abstractData.map(t =>
          typeof t === 'string' ? t : t['#text'] || ''
        ).join(' ');
      } else if (abstractData?.['#text']) {
        abstract = abstractData['#text'];
      }

      // Authors
      const authorList = articleData.AuthorList?.Author;
      const authors = [];
      if (authorList) {
        const authorArray = Array.isArray(authorList) ? authorList : [authorList];
        authorArray.slice(0, 5).forEach(author => {
          const name = [author.ForeName, author.LastName].filter(Boolean).join(' ');
          if (name) authors.push(name);
        });
      }

      // Year
      const pubDate = articleData.Journal?.JournalIssue?.PubDate;
      const year = parseInt(pubDate?.Year) ||
        parseInt(pubDate?.MedlineDate?.substring(0, 4)) ||
        new Date().getFullYear();

      // PMID
      const pmid = medlineCitation.PMID?.['#text'] || medlineCitation.PMID || '';

      // Journal
      const journal = articleData.Journal?.Title || '';

      return {
        title: title.replace(/<[^>]*>/g, ''),
        abstract: abstract.substring(0, 1000).replace(/<[^>]*>/g, ''),
        authors,
        year,
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        pmid: String(pmid),
        journal: journal || 'PubMed Journal',
        citationCount: 1,       // Give PubMed a base citation score (not 0)
        concepts: [],
        relevanceScore: 0.5,    // Give PubMed a base relevance score
        openAccess: false
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = new PubmedService();
