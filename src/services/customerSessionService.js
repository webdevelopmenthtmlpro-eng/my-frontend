import { auth } from '../firebase';

class CustomerSessionService {
  constructor() {
    this.sessionId = null;
    this.customerName = null;
    this.sessionData = null;
    this.apiBase = 'http://localhost:5000/api/chatbot';
  }

  async getAuthToken() {
    const token = await auth.currentUser?.getIdToken();
    return token;
  }

  async initializeSession() {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');
      
      const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0];

      const response = await fetch(`${this.apiBase}/session/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: displayName
        })
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      this.sessionId = data.sessionId;
      this.customerName = data.customerName;
      this.sessionData = data.sessionMetadata;

      console.log(`✅ Session initialized for ${this.customerName}`, this.sessionId);
      return data;
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  async getSessionInfo() {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.apiBase}/session/info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to get session info');

      const data = await response.json();
      this.sessionId = data.session.sessionId;
      this.customerName = data.session.customerName;
      this.sessionData = {
        totalMessages: data.session.totalMessages,
        trackingRequests: data.session.trackingRequests,
        lastTrackingId: data.session.lastTrackingId
      };

      return data.session;
    } catch (error) {
      console.error('Error getting session info:', error);
      throw error;
    }
  }

  async saveMessage(message, from, metadata = {}) {
    try {
      const token = await this.getAuthToken();
      if (!token || !this.sessionId) throw new Error('Invalid session');

      const response = await fetch(`${this.apiBase}/message/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message,
          from,
          metadata
        })
      });

      if (!response.ok) throw new Error('Failed to save message');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getChatHistory(limit = 50) {
    try {
      const token = await this.getAuthToken();
      if (!token || !this.sessionId) throw new Error('Invalid session');

      const response = await fetch(
        `${this.apiBase}/history/${this.sessionId}?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to get chat history');

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async saveTrackingHistory(trackingId, trackingData, context = {}) {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.apiBase}/tracking/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingId,
          trackingData,
          context
        })
      });

      if (!response.ok) throw new Error('Failed to save tracking history');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving tracking history:', error);
      throw error;
    }
  }

  async getTrackingSuggestions(limit = 5) {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${this.apiBase}/tracking/suggestions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to get tracking suggestions');

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting tracking suggestions:', error);
      return [];
    }
  }

  async endSession() {
    try {
      const token = await this.getAuthToken();
      if (!token || !this.sessionId) throw new Error('Invalid session');

      const response = await fetch(`${this.apiBase}/session/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: this.sessionId })
      });

      if (!response.ok) throw new Error('Failed to end session');

      this.sessionId = null;
      this.customerName = null;
      this.sessionData = null;

      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  getCustomerName() {
    return this.customerName;
  }

  getSessionId() {
    return this.sessionId;
  }

  getSessionMetadata() {
    return this.sessionData;
  }
}

let sessionServiceInstance = null;

export const getCustomerSessionService = () => {
  if (!sessionServiceInstance) {
    sessionServiceInstance = new CustomerSessionService();
  }
  return sessionServiceInstance;
};

export default CustomerSessionService;
