import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Microscope, Clock, Hash, Link as LinkIcon, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import PublicationCard from './PublicationCard';
import ClinicalTrialCard from './ClinicalTrialCard';

function MessageBubble({ message }) {
  const [showPubs, setShowPubs] = useState(false);
  const [showTrials, setShowTrials] = useState(false);

  if (message.role === 'user') {
    return (
      <motion.div 
        className="message message-user"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="message-content">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const hasPubs = message.publications && message.publications.length > 0;
  const hasTrials = message.clinicalTrials && message.clinicalTrials.length > 0;
  const metadata = message.metadata;

  return (
    <motion.div 
      className="message message-assistant"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="assistant-avatar">
        <Activity size={20} />
      </div>
      <div style={{ flex: 1, maxWidth: '85%' }}>
        <div className="message-content">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Metadata */}
          {metadata && (
            <div className="message-metadata">
              {metadata.totalRetrieved && (
                <span className="metadata-chip">
                  <Hash size={12} /> {metadata.totalRetrieved} sources
                </span>
              )}
              {metadata.publicationsReturned && (
                <span className="metadata-chip">
                  <BookOpen size={12} /> {metadata.publicationsReturned} papers
                </span>
              )}
              {metadata.trialsReturned && (
                <span className="metadata-chip">
                  <Microscope size={12} /> {metadata.trialsReturned} trials
                </span>
              )}
              {metadata.processingTimeMs && (
                <span className="metadata-chip">
                  <Clock size={12} /> {(metadata.processingTimeMs / 1000).toFixed(1)}s
                </span>
              )}
              {metadata.isFollowUp && (
                <span className="metadata-chip">
                   <LinkIcon size={12} /> Follow-up
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expandable Publications */}
        {hasPubs && (
          <div className="expandable-section">
            <motion.button 
              className="expand-toggle" 
              onClick={() => setShowPubs(!showPubs)}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <BookOpen size={16} /> 
              {showPubs ? 'Hide' : 'View'} Publications ({message.publications.length})
              {showPubs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
            <AnimatePresence>
              {showPubs && (
                <motion.div 
                  className="expanded-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {message.publications.map((pub, i) => (
                    <PublicationCard key={i} publication={pub} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expandable Clinical Trials */}
        {hasTrials && (
          <div className="expandable-section">
            <motion.button 
              className="expand-toggle" 
              onClick={() => setShowTrials(!showTrials)}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <Microscope size={16} /> 
              {showTrials ? 'Hide' : 'View'} Clinical Trials ({message.clinicalTrials.length})
              {showTrials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
            <AnimatePresence>
              {showTrials && (
                <motion.div 
                  className="expanded-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {message.clinicalTrials.map((trial, i) => (
                    <ClinicalTrialCard key={i} trial={trial} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
