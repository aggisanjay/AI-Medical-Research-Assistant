const axios = require('axios');

class ClinicalTrialsService {
  constructor() {
    this.baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
  }

  /**
   * Fetch clinical trials from ClinicalTrials.gov API v2
   */
  async fetchTrials(expandedQuery, options = {}) {
    const { maxResults = 50 } = options;
    const allTrials = [];

    try {
      const { condition, intervention, location } = expandedQuery.clinicalTrialsQuery;

      // Strategy 1: Search by condition + intervention
      if (condition) {
        const trials = await this._fetch({
          'query.cond': condition,
          'query.intr': intervention || undefined,
          pageSize: Math.min(maxResults, 100)
        });
        allTrials.push(...trials);
      }

      // Strategy 2: Broader search with primary query
      if (allTrials.length < 10) {
        const trials = await this._fetch({
          'query.cond': expandedQuery.disease || expandedQuery.primaryQuery,
          pageSize: 50
        });
        allTrials.push(...trials);
      }

      // Deduplicate by NCT ID
      const seen = new Set();
      const deduplicated = allTrials.filter(trial => {
        if (seen.has(trial.nctId)) return false;
        seen.add(trial.nctId);
        return true;
      });

      console.log(`🧪 ClinicalTrials: Retrieved ${deduplicated.length} trials`);
      return deduplicated;

    } catch (error) {
      console.error('ClinicalTrials fetch error:', error.message);
      return [];
    }
  }

  async _fetch(params) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ...params,
          format: 'json'
        },
        timeout: 15000
      });

      const studies = response.data?.studies || [];
      return studies.map(study => this._transformStudy(study)).filter(Boolean);
    } catch (error) {
      console.error('ClinicalTrials API error:', error.message);
      return [];
    }
  }

  _transformStudy(study) {
    try {
      const protocol = study.protocolSection;
      if (!protocol) return null;

      const identification = protocol.identificationModule || {};
      const status = protocol.statusModule || {};
      const design = protocol.designModule || {};
      const eligibility = protocol.eligibilityModule || {};
      const contacts = protocol.contactsLocationsModule || {};
      const description = protocol.descriptionModule || {};

      // Extract locations
      const locations = (contacts.locations || []).slice(0, 3).map(loc => {
        return [loc.facility, loc.city, loc.state, loc.country]
          .filter(Boolean).join(', ');
      });

      // Extract contact info
      const centralContacts = (contacts.centralContacts || []).slice(0, 2).map(c => {
        return [c.name, c.phone, c.email].filter(Boolean).join(' | ');
      });

      // Eligibility text
      const eligibilityText = [
        eligibility.eligibilityCriteria,
        eligibility.minimumAge ? `Min Age: ${eligibility.minimumAge}` : '',
        eligibility.maximumAge ? `Max Age: ${eligibility.maximumAge}` : '',
        eligibility.sex ? `Sex: ${eligibility.sex}` : ''
      ].filter(Boolean).join('\n').substring(0, 500);

      const nctId = identification.nctId || '';

      return {
        title: identification.officialTitle || identification.briefTitle || 'Untitled Trial',
        briefTitle: identification.briefTitle || '',
        status: status.overallStatus || 'Unknown',
        phase: (design.phases || []).join(', ') || 'N/A',
        eligibility: eligibilityText,
        locations: locations.length > 0 ? locations : ['Not specified'],
        contact: centralContacts.length > 0 ? centralContacts.join('; ') : 'Not available',
        nctId,
        url: `https://clinicaltrials.gov/study/${nctId}`,
        briefSummary: (description.briefSummary || '').substring(0, 500),
        startDate: status.startDateStruct?.date || '',
        completionDate: status.completionDateStruct?.date || '',
        enrollmentCount: design.enrollmentInfo?.count || null
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ClinicalTrialsService();
