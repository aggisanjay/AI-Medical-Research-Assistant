import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, History, Activity, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

function Sidebar({ activeConversation, onNewChat, onSelectConversation, refreshTrigger }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  const loadConversations = async () => {
    try {
      const result = await api.listConversations();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        const result = await api.deleteConversation(id);
        if (result.success) {
          if (activeConversation === id) {
            onNewChat();
          }
          loadConversations();
        }
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Activity size={24} />
          </div>
          <h1>Curalink</h1>
        </div>
        <motion.button
          className="new-chat-btn"
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={18} />
          New Research Chat
        </motion.button>
      </div>

      <div className="sidebar-conversations">
        <div className="sidebar-label">
          <History size={12} style={{ marginRight: '6px' }} />
          Recent Research
        </div>

        <AnimatePresence>
          {conversations.map((conv, index) => (
            <motion.div
              key={conv.conversationId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`conv-item ${activeConversation === conv.conversationId ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.conversationId)}
            >
              <div className="conv-item-content">
                <div className="conv-item-title">
                  {conv.disease || conv.lastMessage || 'New Conversation'}
                </div>
                <div className="conv-item-meta">
                  <MessageSquare size={10} />
                  {conv.messageCount} messages · {formatTime(conv.updatedAt)}
                </div>
              </div>
              <button 
                className="delete-conv-btn" 
                onClick={(e) => handleDelete(e, conv.conversationId)}
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {conversations.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No research history found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
