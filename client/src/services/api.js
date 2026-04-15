import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  async sendMessage(payload) {
    const response = await axios.post(`${API_BASE}/chat/message`, payload);
    return response.data;
  },

  async getConversation(conversationId) {
    const response = await axios.get(`${API_BASE}/chat/conversation/${conversationId}`);
    return response.data;
  },

  async listConversations() {
    const response = await axios.get(`${API_BASE}/chat/conversations`);
    return response.data;
  },

  async newConversation() {
    const response = await axios.post(`${API_BASE}/chat/conversation/new`);
    return response.data;
  }
};

export default api;
