import React from 'react';
import { ExternalLink, MapPin, Phone, Info, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

function ClinicalTrialCard({ trial }) {
  const { title, briefTitle, status, phase, eligibility, locations, contact, url, nctId } = trial;

  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('RECRUITING') && !s.includes('NOT')) return 'recruiting';
    if (s.includes('COMPLETED')) return 'completed';
    if (s.includes('ACTIVE')) return 'active';
    return 'other';
  };

  return (
    <motion.div 
      className="trial-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="trial-card-title">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {briefTitle || title} <ExternalLink size={14} style={{ display: 'inline', marginLeft: '4px' }} />
        </a>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <span className={`trial-status ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="trial-info-grid" style={{ display: 'grid', gap: '8px' }}>
        {phase && phase !== 'N/A' && (
          <div className="trial-card-detail">
            <GraduationCap size={14} color="var(--accent-primary)" />
            <strong>Phase:</strong> {phase}
          </div>
        )}
        {locations && locations[0] !== 'Not specified' && (
          <div className="trial-card-detail">
            <MapPin size={14} color="var(--accent-primary)" />
            <strong>Location:</strong> {locations[0]}
          </div>
        )}
        {contact && contact !== 'Not available' && (
          <div className="trial-card-detail">
            <Phone size={14} color="var(--accent-primary)" />
            <strong>Contact:</strong> {contact.split('|')[0]}
          </div>
        )}
        {nctId && (
          <div className="trial-card-detail">
            <Info size={14} color="var(--accent-primary)" />
            <strong>NCT ID:</strong> {nctId}
          </div>
        )}
      </div>

      {eligibility && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Eligibility Requirements
            </summary>
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {eligibility}
            </p>
          </details>
        </div>
      )}
    </motion.div>
  );
}

export default ClinicalTrialCard;
