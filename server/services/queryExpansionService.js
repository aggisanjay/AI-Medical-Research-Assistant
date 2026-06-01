/**
 * Query Expansion Service
 * Takes user input and expands it into multiple search queries
 * for comprehensive retrieval across all sources.
 */

// Medical synonym mappings for common conditions
const DISEASE_SYNONYMS = {
  "parkinson's disease": ["parkinson disease", "parkinsonian disorder", "PD"],
  "parkinson's": ["parkinson disease", "parkinsonian disorder", "PD"],
  "alzheimer's disease": ["alzheimer disease", "AD", "dementia of alzheimer type"],
  "alzheimer's": ["alzheimer disease", "AD", "dementia of alzheimer type"],
  "lung cancer": ["pulmonary carcinoma", "NSCLC", "non-small cell lung cancer", "lung neoplasm"],
  "breast cancer": ["breast carcinoma", "breast neoplasm", "mammary cancer"],
  "diabetes": ["diabetes mellitus", "type 2 diabetes", "T2DM", "type 1 diabetes"],
  "heart disease": ["cardiovascular disease", "coronary artery disease", "cardiac disease", "CVD"],
  "hypertension": ["high blood pressure", "arterial hypertension", "HTN"],
  "depression": ["major depressive disorder", "MDD", "clinical depression"],
  "arthritis": ["rheumatoid arthritis", "osteoarthritis", "joint inflammation"],
  "asthma": ["bronchial asthma", "reactive airway disease"],
  "copd": ["chronic obstructive pulmonary disease", "emphysema", "chronic bronchitis"],
  "stroke": ["cerebrovascular accident", "CVA", "brain infarction"],
  "epilepsy": ["seizure disorder", "epileptic disorder"],
  "multiple sclerosis": ["MS", "demyelinating disease"],
  "hiv": ["human immunodeficiency virus", "HIV/AIDS", "acquired immunodeficiency syndrome"],
  "leukemia": ["blood cancer", "leukaemia", "hematologic malignancy"],
};

// Treatment/intervention keyword expansions
const TREATMENT_EXPANSIONS = {
  "deep brain stimulation": ["DBS", "neurostimulation", "brain stimulation therapy"],
  "immunotherapy": ["immune checkpoint inhibitor", "PD-1 inhibitor", "CAR-T", "immune therapy"],
  "chemotherapy": ["chemo", "cytotoxic therapy", "antineoplastic therapy"],
  "gene therapy": ["gene editing", "CRISPR", "genetic therapy"],
  "stem cell": ["stem cell therapy", "cell therapy", "regenerative medicine"],
  "radiation": ["radiation therapy", "radiotherapy", "radiation treatment"],
  "surgery": ["surgical intervention", "operative treatment"],
  "vitamin d": ["cholecalciferol", "vitamin D3", "ergocalciferol", "25-hydroxyvitamin D"],
};

class QueryExpansionService {
  /**
   * Main expansion method - takes structured or natural input
   * and returns expanded search queries
   */
  expand(input) {
    const { disease, query, location, naturalQuery } = this._normalizeInput(input);

    const expandedQueries = [];
    const searchTerms = new Set();

    // 1. Primary combined query (disease + specific query)
    if (disease && query) {
      expandedQueries.push(`${query} ${disease}`);
      expandedQueries.push(`${disease} ${query}`);
      searchTerms.add(disease.toLowerCase());
      searchTerms.add(query.toLowerCase());
    } else if (naturalQuery) {
      expandedQueries.push(naturalQuery);
      const extracted = this._extractKeyTerms(naturalQuery);
      extracted.forEach(t => searchTerms.add(t));
    }

    // 2. Add disease synonyms
    const diseaseLower = (disease || '').toLowerCase();
    if (DISEASE_SYNONYMS[diseaseLower]) {
      DISEASE_SYNONYMS[diseaseLower].forEach(syn => {
        if (query) {
          expandedQueries.push(`${query} ${syn}`);
        }
        searchTerms.add(syn);
      });
    }

    // 3. Add treatment expansions
    const queryLower = (query || naturalQuery || '').toLowerCase();
    Object.keys(TREATMENT_EXPANSIONS).forEach(key => {
      if (queryLower.includes(key)) {
        TREATMENT_EXPANSIONS[key].forEach(exp => {
          expandedQueries.push(disease ? `${exp} ${disease}` : exp);
          searchTerms.add(exp);
        });
      }
    });

    // 4. Generate PubMed-optimized query
    const pubmedQuery = this._buildPubmedQuery(disease, query, naturalQuery);

    // 5. Generate clinical trials query
    const clinicalTrialsQuery = {
      condition: disease || this._extractDisease(naturalQuery) || naturalQuery,
      intervention: query || '',
      location: location || ''
    };

    return {
      primaryQuery: expandedQueries[0] || naturalQuery || `${disease} ${query}`.trim(),
      expandedQueries: [...new Set(expandedQueries)],
      searchTerms: [...searchTerms],
      pubmedQuery,
      clinicalTrialsQuery,
      disease: disease || this._extractDisease(naturalQuery) || '',
      location: location || ''
    };
  }

  _normalizeInput(input) {
    if (typeof input === 'string') {
      return { naturalQuery: input, disease: '', query: '', location: '' };
    }
    return {
      disease: input.disease || '',
      query: input.query || '',
      location: input.location || '',
      naturalQuery: input.naturalQuery || ''
    };
  }

  _extractKeyTerms(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'shall', 'for', 'and', 'nor', 'but',
      'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'with', 'by',
      'from', 'as', 'into', 'about', 'what', 'which', 'who', 'whom',
      'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our',
      'you', 'your', 'he', 'him', 'she', 'her', 'it', 'its', 'they',
      'them', 'their', 'latest', 'recent', 'new', 'top', 'best', 'most'
    ]);

    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  _extractDisease(text) {
    if (!text) return '';
    const textLower = text.toLowerCase();
    for (const disease of Object.keys(DISEASE_SYNONYMS)) {
      if (textLower.includes(disease)) return disease;
    }
    // Common disease patterns
    const patterns = [
      /(?:for|about|on|in)\s+([\w\s]+?)(?:\s+(?:treatment|therapy|research|studies|trials|patients))/i,
      /([\w\s]+?)\s+(?:treatment|therapy|research|studies|trials|patients)/i,
      /(?:treatment|therapy|research|studies|trials)\s+(?:for|of|in)\s+([\w\s]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  _buildPubmedQuery(disease, query, naturalQuery) {
    const parts = [];
    if (disease) parts.push(`(${disease}[Title/Abstract])`);
    if (query) parts.push(`(${query}[Title/Abstract])`);
    if (!disease && !query && naturalQuery) {
      const terms = this._extractKeyTerms(naturalQuery);
      return terms.map(t => `(${t}[Title/Abstract])`).join(' AND ');
    }
    return parts.join(' AND ') || naturalQuery || '';
  }
}

module.exports = new QueryExpansionService();
