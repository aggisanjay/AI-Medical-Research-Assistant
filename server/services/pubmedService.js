const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class PubmedService {
  constructor() {
    this.searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    this.fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
    this.summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
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
      // Step 0: Direct PMID fetch if provided
      if (expandedQuery?.pmids || expandedQuery?.pmid) {
        const directPmids = Array.isArray(expandedQuery.pmids)
          ? expandedQuery.pmids
          : [expandedQuery.pmid || expandedQuery.pmids];
        const publications = await this._fetchDetails(directPmids);
        console.log(`📄 PubMed: Retrieved ${publications.length} publications directly via PMIDs`);
        return publications;
      }

      // Step 1: Search for PMIDs using multiple query variants
      const queries = (
        Array.isArray(expandedQuery)
          ? expandedQuery
          : typeof expandedQuery === 'string'
            ? [expandedQuery]
            : [
                expandedQuery?.pubmedQuery,
                expandedQuery?.primaryQuery,
                expandedQuery?.query,
                ...(Array.isArray(expandedQuery?.expandedQueries) ? expandedQuery.expandedQueries : [])
              ]
      ).filter(Boolean);

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
    const cleanQuery = typeof query === 'string' ? query.trim() : '';
    if (!cleanQuery) return [];

    const targetMax = Math.min(Math.max(retMax || 20, 10), 100);

    // Tier 1: Try official NCBI ESearch API
    try {
      const params = {
        db: 'pubmed',
        term: cleanQuery,
        retmax: targetMax,
        retmode: 'json',
        tool: 'curalink_research',
        email: 'research@curalink.io'
      };

      if (process.env.NCBI_API_KEY) {
        params.api_key = process.env.NCBI_API_KEY;
      }

      const response = await axios.get(this.searchUrl, {
        params,
        headers: {
          'User-Agent': 'CuraLink/1.0 (mailto:research@curalink.io)'
        },
        timeout: 4000
      });

      const idList = response.data?.esearchresult?.idlist;
      if (Array.isArray(idList) && idList.length > 0) {
        return idList;
      }
    } catch (err) {
      console.warn(`PubMed ESearch API transient error (${err.message}). Using PubMed search gateway...`);
    }

    // Tier 2: PubMed Web Search Gateway (fast, resilient, returns exact real-time PMIDs)
    try {
      const sizeParam = targetMax <= 10 ? 10 : targetMax <= 20 ? 20 : targetMax <= 50 ? 50 : 100;
      const webRes = await axios.get('https://pubmed.ncbi.nlm.nih.gov/', {
        params: {
          term: cleanQuery,
          size: sizeParam
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });

      const html = webRes.data || '';
      const idSet = new Set();

      // Extract search-result-selector-<pmid>
      const selectorMatches = html.match(/search-result-selector-([0-9]+)/g) || [];
      selectorMatches.forEach(m => idSet.add(m.replace('search-result-selector-', '')));

      // Extract data-article-id="<pmid>"
      const articleIdMatches = html.match(/data-article-id=["']?([0-9]+)["']?/g) || [];
      articleIdMatches.forEach(m => {
        const digits = m.replace(/[^0-9]/g, '');
        if (digits) idSet.add(digits);
      });

      // Extract <span class="docsum-pmid"><pmid></span>
      const docsumMatches = html.match(/class=["']docsum-pmid["']>([0-9]+)</g) || [];
      docsumMatches.forEach(m => {
        const digits = m.replace(/[^0-9]/g, '');
        if (digits) idSet.add(digits);
      });

      if (idSet.size > 0) {
        return [...idSet].slice(0, targetMax);
      }
    } catch (webErr) {
      console.warn(`PubMed Web gateway error: ${webErr.message}`);
    }

    // Tier 3: PubMed Central (PMC) index fallback
    try {
      const pmcRes = await axios.get(this.searchUrl, {
        params: {
          db: 'pmc',
          term: cleanQuery,
          retmax: Math.min(targetMax, 50),
          retmode: 'json'
        },
        headers: {
          'User-Agent': 'CuraLink/1.0 (mailto:research@curalink.io)'
        },
        timeout: 4000
      });
      const pmcIds = pmcRes.data?.esearchresult?.idlist;
      if (Array.isArray(pmcIds) && pmcIds.length > 0) {
        return pmcIds;
      }
    } catch (pmcErr) {
      // PMC fallback silent
    }

    return [];
  }

  async _fetchDetails(pmids) {
    const batchSize = 25;
    const allPublications = [];

    for (let i = 0; i < pmids.length; i += batchSize) {
      const batch = pmids.slice(i, i + batchSize);
      try {
        const params = {
          db: 'pubmed',
          id: batch.join(','),
          retmode: 'xml'
        };
        if (process.env.NCBI_API_KEY) {
          params.api_key = process.env.NCBI_API_KEY;
        }

        const response = await axios.get(this.fetchUrl, {
          params,
          headers: {
            'User-Agent': 'CuraLink/1.0 (mailto:research@curalink.io)'
          },
          timeout: 15000
        });

        const articles = this._parseXml(response.data);
        if (articles.length > 0) {
          allPublications.push(...articles);
        } else {
          // If XML parse yielded 0, try summary fallback for this batch
          const summaries = await this._fetchSummaryDetails(batch);
          allPublications.push(...summaries);
        }
      } catch (error) {
        console.warn(`PubMed batch fetch warning (${error.message}). Trying ESummary fallback...`);
        const summaries = await this._fetchSummaryDetails(batch);
        allPublications.push(...summaries);
      }
    }

    return allPublications;
  }

  async _fetchSummaryDetails(batch) {
    try {
      const response = await axios.get(this.summaryUrl, {
        params: {
          db: 'pubmed',
          id: batch.join(','),
          retmode: 'json'
        },
        headers: {
          'User-Agent': 'CuraLink/1.0 (mailto:research@curalink.io)'
        },
        timeout: 12000
      });
      const result = response.data?.result || {};
      const uids = result.uids || [];
      return uids.map(uid => {
        const doc = result[uid];
        if (!doc) return null;
        const authors = (doc.authors || []).map(a => a.name).filter(Boolean);
        const year = parseInt((doc.pubdate || '').substring(0, 4)) || new Date().getFullYear();
        return {
          title: (doc.title || 'Untitled').replace(/<[^>]*>/g, ''),
          abstract: (doc.source || doc.title || '').replace(/<[^>]*>/g, ''),
          authors,
          year,
          source: 'PubMed',
          url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          pmid: String(uid),
          journal: doc.source || doc.fulljournalname || 'PubMed Journal',
          citationCount: 1,
          concepts: [],
          relevanceScore: 0.5,
          openAccess: false
        };
      }).filter(Boolean);
    } catch (err) {
      console.error(`PubMed summary fallback error: ${err.message}`);
      return [];
    }
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
