import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

function App() {
  const [conversationId, setConversationId] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const handleNewChat = useCallback(() => {
    setConversationId(null);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setConversationId(id);
  }, []);

  const handleConversationUpdate = useCallback(() => {
    setRefreshSidebar(prev => prev + 1);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        activeConversation={conversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        refreshTrigger={refreshSidebar}
      />
      <ChatInterface
        conversationId={conversationId}
        setConversationId={setConversationId}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
}

export default App;
