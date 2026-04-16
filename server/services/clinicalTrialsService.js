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
          'query.locn': location || undefined,
          pageSize: Math.min(maxResults, 100)
        });
        allTrials.push(...trials);
      }

      // Strategy 2: Broader search with primary query
      if (allTrials.length < 10) {
        const trials = await this._fetch({
          'query.cond': expandedQuery.disease || expandedQuery.primaryQuery,
          'query.locn': location || undefined,
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
      const locationsRaw = (contacts.locations || [])
        .slice(0, 3)
        .map(loc => {
          const parts = [loc.facility, loc.city, loc.state, loc.country].filter(Boolean);
          const cleanParts = [];
          parts.forEach(part => {
             // Only add a geographic part if the facility string or a previous part doesn't already contain it exactly to avoid "Beijing, Beijing"
             const isDuplicate = cleanParts.some(cp => cp.toLowerCase().includes(part.toLowerCase()));
             if (!isDuplicate) {
                 cleanParts.push(part);
             }
          });
          return cleanParts.join(', ');
        })
        .filter(Boolean); // Ensure no empty strings in the final list
        
      const locations = [...new Set(locationsRaw)];

      // Extract contact info
      const centralContactsRaw = (contacts.centralContacts || []).slice(0, 2).map(c => {
        return [c.name, c.phone, c.email].filter(Boolean).join(' | ');
      });
      let centralContacts = [...new Set(centralContactsRaw)];

      // Fallback to overall officials if no central contacts
      if (centralContacts.length === 0) {
        const officialsRaw = (contacts.overallOfficials || []).slice(0, 2).map(o => {
          return [o.name, o.affiliation].filter(Boolean).join(' | ');
        });
        centralContacts = [...new Set(officialsRaw)];
      }

      // Fallback to location contacts
      if (centralContacts.length === 0) {
        const locContactsRaw = (contacts.locations || [])
          .filter(loc => loc.contacts && loc.contacts.length > 0)
          .slice(0, 2)
          .map(loc => {
            const c = loc.contacts[0];
            return [c.name, c.phone, c.email].filter(Boolean).join(' | ');
          });
        centralContacts = [...new Set(locContactsRaw)];
      }

      // Eligibility text
      const eligibilityText = [
        eligibility.eligibilityCriteria,
        eligibility.minimumAge ? `Min Age: ${eligibility.minimumAge}` : '',
        eligibility.maximumAge ? `Max Age: ${eligibility.maximumAge}` : '',
        eligibility.sex ? `Sex: ${eligibility.sex}` : ''
      ].filter(Boolean).join('\n').substring(0, 500);

      const nctId = identification.nctId || '';

      // Fallback location to organization if no specific sites
      const finalLocations = locations.length > 0 
        ? locations 
        : (identification.organization?.fullName ? [identification.organization.fullName] : ['Not specified']);

      return {
        title: identification.officialTitle || identification.briefTitle || 'Untitled Trial',
        briefTitle: identification.briefTitle || '',
        status: status.overallStatus || 'Unknown',
        phase: (design.phases || []).join(', ') || 'N/A',
        eligibility: eligibilityText,
        locations: finalLocations,
        contact: centralContacts.length > 0 ? centralContacts.join('; ') : 'Not available',
        nctId,
        url: `https://clinicaltrials.gov/study/${nctId}`,
        briefSummary: (description.briefSummary || '').substring(0, 500),
        startDate: status.startDateStruct?.date || '',
        completionDate: status.completionDateStruct?.date || '',
        enrollmentCount: design.enrollmentInfo?.count || null,
        organization: identification.organization?.fullName || 'Not specified'
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ClinicalTrialsService();
