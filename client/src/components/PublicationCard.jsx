import React from 'react';
import { ExternalLink, Calendar, Users, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

function PublicationCard({ publication }) {
  const { title, abstract, authors, year, source, url, totalScore } = publication;

  return (
    <motion.div 
      className="pub-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="pub-card-title">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          {title} <ExternalLink size={14} style={{ display: 'inline', marginLeft: '4px' }} />
        </a>
      </div>
      {abstract && (
        <div className="pub-card-abstract">
          {abstract}
        </div>
      )}
      <div className="pub-card-meta">
        <span className={`source-badge ${source?.toLowerCase()}`}>
          {source}
        </span>
        {year && (
          <span className="metadata-chip">
            <Calendar size={12} /> {year}
          </span>
        )}
        {authors && authors.length > 0 && (
          <span className="metadata-chip">
            <Users size={12} /> {authors[0]}{authors.length > 1 ? ' et al.' : ''}
          </span>
        )}
        {totalScore && (
          <span className="metadata-chip" style={{ color: 'var(--accent-primary)' }}>
            <Star size={12} fill="currentColor" /> {Math.round(totalScore)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default PublicationCard;
