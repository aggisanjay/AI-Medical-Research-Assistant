import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, ClipboardList, Activity, Sparkles, Brain, Stethoscope, Heart, Search, Menu } from 'lucide-react';
import api from '../services/api';
import MessageBubble from './MessageBubble';
import StructuredInput from './StructuredInput';
import VoiceAssistant from './VoiceAssistant';

function ChatInterface({ conversationId, setConversationId, onConversationUpdate, toggleSidebar }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState('natural'); // 'natural' or 'structured'
  const [loadingStep, setLoadingStep] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversation = async (id) => {
    try {
      const result = await api.getConversation(id);
      if (result.success) {
        setMessages(result.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const sendMessage = useCallback(async (payload) => {
    setIsLoading(true);
    setLoadingStep('Expanding query & fetching research...');

    const userContent = payload.isStructured
      ? [
        payload.patientName && `Patient: ${payload.patientName}`,
        payload.disease && `Disease: ${payload.disease}`,
        payload.query && `Query: ${payload.query}`,
        payload.location && `Location: ${payload.location}`
      ].filter(Boolean).join(' | ')
      : payload.message;

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: userContent }]);

    try {
      const requestPayload = {
        conversationId: conversationId || undefined,
        ...payload
      };

      setTimeout(() => setLoadingStep('Analyzing publications & clinical trials...'), 3000);
      setTimeout(() => setLoadingStep('Ranking results & generating insights...'), 7000);

      const result = await api.sendMessage(requestPayload);

      if (result.success) {
        if (!conversationId) {
          setConversationId(result.conversationId);
        }

        const assistantMsg = {
          role: 'assistant',
          content: result.data.response,
          suggestedQuestions: result.data.suggestedQuestions,
          publications: result.data.publications,
          clinicalTrials: result.data.clinicalTrials,
          metadata: result.data.metadata
        };

        setMessages(prev => [...prev, assistantMsg]);
        onConversationUpdate();
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ An error occurred. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to process your request. Please check your connection and try again.'
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [conversationId, setConversationId, onConversationUpdate]);

  const handleNaturalSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage({ message: inputText.trim() });
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleStructuredSubmit = (formData) => {
    sendMessage(formData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNaturalSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = '44px';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleQuickAction = (query) => {
    sendMessage({ message: query });
  };

  const handleSpeechToText = (text) => {
    if (text.trim()) {
      setInputText(''); // Clear input text since we're sending
      sendMessage({ message: text.trim() });
    }
  };


  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content;

  return (
    <div className="main-content">
      {/* Header */}
      <motion.div
        className="chat-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div>
            <div className="chat-header-title">Medical Assistant</div>
            <div className="chat-header-subtitle">
              <span className="pulse-indicator"></span>
              <span className="hide-mobile">Powered by AI · PubMed · OpenAlex</span>
            </div>
          </div>
        </div>
        <div className="input-mode-toggle">
          <button
            className={`mode-btn ${inputMode === 'natural' ? 'active' : ''}`}
            onClick={() => setInputMode('natural')}
          >
            <MessageSquare size={16} />
            Chat
          </button>
          <button
            className={`mode-btn ${inputMode === 'structured' ? 'active' : ''}`}
            onClick={() => setInputMode('structured')}
          >
            <ClipboardList size={16} />
            Structured
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.length === 0 && !isLoading ? (
            <motion.div
              className="welcome-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="welcome-icon">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Brain size={64} color="var(--accent-primary)" />
                </motion.div>
              </div>
              <h2>Welcome to Curalink</h2>
              <p>
                Your AI-powered medical research companion. Ask about diseases, treatments,
                clinical trials, and get structured, source-backed answers from the latest research.
              </p>
              <div className="quick-actions">
                <motion.div
                  className="quick-action"
                  onClick={() => handleQuickAction('Latest treatment for lung cancer')}
                  whileHover={{ y: -4 }}
                >
                  <div className="quick-action-icon"><Activity size={20} /></div>
                  <div className="quick-action-text">Latest treatment for lung cancer</div>
                </motion.div>
                <motion.div
                  className="quick-action"
                  onClick={() => handleQuickAction('Clinical trials for diabetes')}
                  whileHover={{ y: -4 }}
                >
                  <div className="quick-action-icon"><Stethoscope size={20} /></div>
                  <div className="quick-action-text">Clinical trials for diabetes</div>
                </motion.div>
                <motion.div
                  className="quick-action"
                  onClick={() => handleQuickAction('Top researchers in Alzheimer\'s disease')}
                  whileHover={{ y: -4 }}
                >
                  <div className="quick-action-icon"><Sparkles size={20} /></div>
                  <div className="quick-action-text">Top researchers in Alzheimer's disease</div>
                </motion.div>
                <motion.div
                  className="quick-action"
                  onClick={() => handleQuickAction('Recent studies on heart disease')}
                  whileHover={{ y: -4 }}
                >
                  <div className="quick-action-icon"><Heart size={20} /></div>
                  <div className="quick-action-text">Recent studies on heart disease</div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  isLatest={i === messages.length - 1}
                  onQuickAction={handleQuickAction}
                />
              ))}
              {isLoading && (
                <motion.div
                  className="loading-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="assistant-avatar"><Activity size={20} /></div>
                  <div className="loading-dots-container">
                    <div className="loading-dots">
                      <motion.div className="loading-dot" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                      <motion.div className="loading-dot" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                      <motion.div className="loading-dot" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                    </div>
                    <div className="loading-text">{loadingStep}</div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container-glass">
          {inputMode === 'natural' ? (
            <form className="natural-input-container" onSubmit={handleNaturalSubmit}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about diseases, treatments, clinical trials..."
                disabled={isLoading}
                rows={1}
              />
              <div className="input-actions-group">
                <VoiceAssistant 
                  onSpeechToText={handleSpeechToText}
                  lastAssistantMessage={lastAssistantMessage}
                  isLoading={isLoading}
                />
                <motion.button
                  type="submit"
                  className="send-btn"
                  disabled={isLoading || !inputText.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </form>
          ) : (
            <StructuredInput onSubmit={handleStructuredSubmit} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
