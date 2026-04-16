import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Microscope,
  Clock,
  Hash,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import PublicationCard from './PublicationCard';
import ClinicalTrialCard from './ClinicalTrialCard';

function MessageBubble({ message, isLatest, onQuickAction }) {
  const [showPubs, setShowPubs] = useState(false);
  const [showTrials, setShowTrials] = useState(false);

  if (message.role === 'user') {
    return (
      <motion.div
        className="message message-user"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="message-content">{message.content}</div>
      </motion.div>
    );
  }

  const hasPubs = message.publications?.length > 0;
  const hasTrials = message.clinicalTrials?.length > 0;
  const metadata = message.metadata;

  // Clean markdown content helper for robust rendering
  const cleanContent = (text) => {
    if (!text) return '';
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '  ')
      .replace(/\\\*/g, '*')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\n{4,}/g, '\n\n\n');
  };

  return (
    <motion.div
      className="message message-assistant"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="assistant-avatar">
        <Activity size={20} />
      </div>
      <div className="assistant-response-wrapper">

        {/* Main Response content with Premium Markdown Handlers */}
        <div className="message-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom link renderer with "External" indicator
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>
              ),
              // Glassmorphism Table Wrapper
              table: ({ children }) => (
                <div className="table-wrapper">
                  <table>{children}</table>
                </div>
              ),
              // Premium Hierarchy Headings
              h2: ({ children }) => <h2 className="response-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="response-h3">{children}</h3>,
              h4: ({ children }) => <h4 className="response-h4">{children}</h4>,
              // Styled blockquotes for research snippets
              blockquote: ({ children }) => (
                <blockquote className="response-blockquote">{children}</blockquote>
              ),
              // Fade-out dividers
              hr: () => <hr className="response-divider" />,
            }}
          >
            {cleanContent(message.content)}
          </ReactMarkdown>
        </div>

        {/* Intelligence Metadata Bar */}
        {metadata && (
          <div className="metadata-bar">
            {metadata.totalRetrieved > 0 && (
              <span className="metadata-chip">
                <Hash size={11} /> {metadata.totalRetrieved} sources analyzed
              </span>
            )}
            {metadata.publicationsReturned > 0 && (
              <span className="metadata-chip">
                <BookOpen size={11} /> {metadata.publicationsReturned} publications
              </span>
            )}
            {metadata.trialsReturned > 0 && (
              <span className="metadata-chip">
                <Microscope size={11} /> {metadata.trialsReturned} trials
              </span>
            )}
            {metadata.processingTimeMs > 0 && (
              <span className="metadata-chip">
                <Clock size={11} /> {(metadata.processingTimeMs / 1000).toFixed(1)}s
              </span>
            )}
            {metadata.isFollowUp && (
              <span className="metadata-chip chip-followup">
                <LinkIcon size={11} /> Follow-up
              </span>
            )}
          </div>
        )}

        {/* Expandable Secondary Evidence (Source Cards) */}
        <div className="source-cards-container">
          {hasPubs && (
            <div className="expandable-section">
              <button
                className="expand-toggle"
                onClick={() => setShowPubs(!showPubs)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} />
                  {showPubs ? 'Hide' : 'View'} Source Publications ({message.publications.length})
                </span>
                <span className="expand-arrow">
                  {showPubs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>
              <AnimatePresence>
                {showPubs && (
                  <motion.div
                    className="expanded-content"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {message.publications.map((pub, i) => (
                      <PublicationCard key={i} publication={pub} index={i + 1} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {hasTrials && (
            <div className="expandable-section">
              <button
                className="expand-toggle toggle-trials"
                onClick={() => setShowTrials(!showTrials)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Microscope size={14} />
                  {showTrials ? 'Hide' : 'View'} Clinical Trials ({message.clinicalTrials.length})
                </span>
                <span className="expand-arrow">
                  {showTrials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>
              <AnimatePresence>
                {showTrials && (
                  <motion.div
                    className="expanded-content"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {message.clinicalTrials.map((trial, i) => (
                      <ClinicalTrialCard key={i} trial={trial} index={i + 1} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        {isLatest && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="suggested-questions-container">
            {message.suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                className="suggested-question-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => onQuickAction(q)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{q}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
