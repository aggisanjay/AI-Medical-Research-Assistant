import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Star, ExternalLink, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

function PublicationCard({ publication, index }) {
  const [expanded, setExpanded] = useState(false);
  const { title, abstract, authors, year, source, url, totalScore } = publication;

  const authorStr = authors?.length > 0
    ? authors.slice(0, 4).join(', ') + (authors.length > 4 ? ' et al.' : '')
    : 'Authors not listed';

  const cleanAbstract = abstract
    ? abstract.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Abstract not available';

  const shortAbstract = cleanAbstract.substring(0, 200);
  const hasMore = cleanAbstract.length > 200;

  return (
    <motion.div 
      className="pub-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: 'var(--accent-primary)' }}
    >
      {/* Header: Index + Source Badge */}
      <div className="pub-card-header">
        <span className="pub-card-index">#{index}</span>
        <span className={`source-badge ${source?.toLowerCase()}`}>
          {source}
        </span>
      </div>

      {/* REQUIRED: Title */}
      <h4 className="pub-card-title">
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title} <ExternalLink size={14} />
        </a>
      </h4>

      {/* REQUIRED: Abstract / Summary */}
      <div className="pub-card-abstract-section">
        <span className="pub-field-label">
          <BookOpen size={11} style={{ display: 'inline', marginRight: '4px' }} /> Abstract / Summary:
        </span>
        <p className="pub-card-abstract">
          {expanded ? cleanAbstract : shortAbstract}
          {hasMore && !expanded && '...'}
        </p>
        {hasMore && (
          <button
            className="read-more-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Show Less <ChevronUp size={12} style={{ display: 'inline' }} /></>
            ) : (
              <>Read More <ChevronDown size={12} style={{ display: 'inline' }} /></>
            )}
          </button>
        )}
      </div>

      {/* REQUIRED: Authors, Year, Source, URL */}
      <div className="pub-details-grid">
        <div className="pub-detail-row">
          <span className="pub-field-label">
            <Users size={11} style={{ display: 'inline', marginRight: '4px' }} /> Authors:
          </span>
          <span className="pub-field-value">{authorStr}</span>
        </div>
        <div className="pub-detail-row">
          <span className="pub-field-label">
            <Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} /> Year:
          </span>
          <span className="pub-field-value">{year || 'Not available'}</span>
        </div>
        <div className="pub-detail-row">
          <span className="pub-field-label">
            <Star size={11} style={{ display: 'inline', marginRight: '4px' }} /> Source:
          </span>
          <span className="pub-field-value">{source}</span>
        </div>
        <div className="pub-detail-row">
          <span className="pub-field-label">
            <ExternalLink size={11} style={{ display: 'inline', marginRight: '4px' }} /> URL:
          </span>
          <span className="pub-field-value">
            <a href={url} target="_blank" rel="noopener noreferrer">
              View Full Publication ↗
            </a>
          </span>
        </div>
        {totalScore && (
          <div className="pub-detail-row">
            <span className="pub-field-label">
              <Star size={11} style={{ display: 'inline', marginRight: '4px' }} /> Relevance:
            </span>
            <span className="pub-field-value">Score: {Math.round(totalScore)}/100</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PublicationCard;
