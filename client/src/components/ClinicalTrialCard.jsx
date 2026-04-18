import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ClipboardList, Info, MapPin, Phone, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

function ClinicalTrialCard({ trial, index }) {
  const [showEligibility, setShowEligibility] = useState(false);
  const {
    title, briefTitle, status, phase,
    eligibility, locations, contact, url, nctId, organization
  } = trial;

  const getStatusClass = (s) => {
    const upper = (s || '').toUpperCase();
    if (upper.includes('RECRUITING') && !upper.includes('NOT')) return 'recruiting';
    if (upper.includes('COMPLETED')) return 'completed';
    if (upper.includes('ACTIVE')) return 'active';
    return 'other';
  };

  const parseEligibility = (text) => {
    if (!text) return null;
    const sections = text.split(/(?=Inclusion Criteria:|Exclusion Criteria:)/i);
    return sections.map((section, i) => {
      const lines = section.split('\n').filter(l => l.trim());
      const header = lines[0];
      const items = lines.slice(1).map(item => item.replace(/^[-•*]\s*/, '').trim());
      return (
        <div key={i} className="eligibility-section-block">
          <h5 className="eligibility-header">{header}</h5>
          <ul className="eligibility-list">
            {items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        </div>
      );
    });
  };

  const cleanText = (text) => {
    if (!text) return 'Not specified';
    return text
      .replace(/\*/g, '•')
      .replace(/\\n/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\\/g, '')
      .replace(/\(/g, '(')
      .replace(/\)/g, ')')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const displayTitle = briefTitle || title;
  const filteredLocs = locations?.filter(l => l && l !== 'Not specified') || [];
  
  let locationStr = 'Location not specified';
  if (filteredLocs.length > 0) {
    locationStr = filteredLocs.slice(0, 5).join('; ');
  } else if (organization && organization !== 'Not specified') {
    locationStr = organization;
  }
  const contactStr = contact && contact !== 'Not available'
    ? contact
    : 'Contact information not available';

  return (
    <motion.div 
      className="trial-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: 'var(--success)' }}
    >
      <div className="trial-card-header">
        <span className="trial-card-index">#{index}</span>
        <span className={`trial-status ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>

      <h4 className="trial-card-title">
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {displayTitle} <ExternalLink size={14} />
        </a>
      </h4>

      <div className="trial-details-grid">
        <div className="trial-detail-row">
          <span className="trial-detail-label">
            <Info size={11} style={{ display: 'inline', marginRight: '4px' }} /> Recruiting Status:
          </span>
          <span className="trial-detail-value">
            <span className={`status-text ${getStatusClass(status)}`}>
              {status}
            </span>
          </span>
        </div>

        <div className="trial-detail-row">
          <span className="trial-detail-label">
            <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} /> Location:
          </span>
          <span className="trial-detail-value">{locationStr}</span>
        </div>

        <div className="trial-detail-row">
          <span className="trial-detail-label">
            <Phone size={11} style={{ display: 'inline', marginRight: '4px' }} /> Contact:
          </span>
          <span className="trial-detail-value">{contactStr}</span>
        </div>

        {phase && phase !== 'N/A' && (
          <div className="trial-detail-row">
            <span className="trial-detail-label">
              <GraduationCap size={11} style={{ display: 'inline', marginRight: '4px' }} /> Phase:
            </span>
            <span className="trial-detail-value">{phase}</span>
          </div>
        )}

        {nctId && (
          <div className="trial-detail-row">
            <span className="trial-detail-label">
              <ClipboardList size={11} style={{ display: 'inline', marginRight: '4px' }} /> NCT ID:
            </span>
            <span className="trial-detail-value">{nctId}</span>
          </div>
        )}

        <div className="trial-detail-row">
          <span className="trial-detail-label">
            <ExternalLink size={11} style={{ display: 'inline', marginRight: '4px' }} /> URL:
          </span>
          <span className="trial-detail-value">
            <a href={url} target="_blank" rel="noopener noreferrer">
              View on ClinicalTrials.gov ↗
            </a>
          </span>
        </div>
      </div>

      <div className="trial-eligibility-section">
        <button
          className="eligibility-toggle"
          onClick={() => setShowEligibility(!showEligibility)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={14} /> Eligibility Criteria
          </span>
          {showEligibility ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showEligibility && (
          <motion.div 
            className="eligibility-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {parseEligibility(cleanText(eligibility))}
          </motion.div>
        )}

        {!showEligibility && eligibility && (
          <p className="eligibility-preview">
            {cleanText(eligibility).substring(0, 300)}...
          </p>
        )}

        {!eligibility && (
          <p className="eligibility-preview">
            Eligibility criteria not specified for this trial.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default ClinicalTrialCard;
