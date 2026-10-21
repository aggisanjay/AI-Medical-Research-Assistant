const multiAgentWorkflow = require('./multiAgentWorkflow');

class Orchestrator {
  /**
   * Main research pipeline: delegates to the 9-Agent Multi-Agent Workflow Engine
   */
  async processQuery(input, conversationId, userId) {
    return multiAgentWorkflow.executeWorkflow({
      input,
      conversationId,
      userId: userId || 'user_researcher',
      workspaceId: input.workspaceId || 'default-workspace'
    });
  }
}

module.exports = new Orchestrator();
