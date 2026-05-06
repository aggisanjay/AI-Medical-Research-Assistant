import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

function App() {
  const [conversationId, setConversationId] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setIsSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setConversationId(id);
    setIsSidebarOpen(false);
  }, []);

  const handleConversationUpdate = useCallback(() => {
    setRefreshSidebar(prev => prev + 1);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        activeConversation={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        refreshTrigger={refreshSidebar}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatInterface
        conversationId={conversationId}
        setConversationId={setConversationId}
        onConversationUpdate={handleConversationUpdate}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
}

export default App;
