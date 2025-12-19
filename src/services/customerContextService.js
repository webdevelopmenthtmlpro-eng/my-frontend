import { getCustomerSessionService } from './customerSessionService';

class CustomerContextService {
  constructor() {
    this.sessionService = getCustomerSessionService();
    this.context = {
      customerName: null,
      recentTrackingIds: [],
      conversationHistory: [],
      trackingSuggestions: [],
      lastInteraction: null,
      messageCount: 0
    };
  }

  async initializeContext() {
    try {
      await this.sessionService.initializeSession();
      this.context.customerName = this.sessionService.getCustomerName();

      const suggestions = await this.sessionService.getTrackingSuggestions(5);
      this.context.trackingSuggestions = suggestions;

      if (suggestions.length > 0) {
        this.context.recentTrackingIds = suggestions.map(s => s.trackingId);
      }

      console.log('✅ Customer context initialized:', this.context);
      return true;
    } catch (error) {
      console.error('Error initializing customer context:', error);
      return false;
    }
  }

  async updateContextWithMessage(message, messageType = 'customer') {
    try {
      const metadata = {
        timestamp: new Date(),
        type: messageType
      };

      await this.sessionService.saveMessage(message, messageType, metadata);
      this.context.messageCount += 1;
      this.context.lastInteraction = new Date();

      return true;
    } catch (error) {
      console.error('Error updating context:', error);
      return false;
    }
  }

  async updateTrackingContext(trackingId, trackingData = null) {
    try {
      await this.sessionService.saveTrackingHistory(trackingId, trackingData, {
        source: 'chatbot',
        timestamp: new Date()
      });

      if (!this.context.recentTrackingIds.includes(trackingId)) {
        this.context.recentTrackingIds.unshift(trackingId);
        if (this.context.recentTrackingIds.length > 10) {
          this.context.recentTrackingIds.pop();
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating tracking context:', error);
      return false;
    }
  }

  async loadConversationHistory(limit = 20) {
    try {
      const messages = await this.sessionService.getChatHistory(limit);
      this.context.conversationHistory = messages;
      return messages;
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  async refreshTrackingSuggestions() {
    try {
      const suggestions = await this.sessionService.getTrackingSuggestions(5);
      this.context.trackingSuggestions = suggestions;
      return suggestions;
    } catch (error) {
      console.error('Error refreshing tracking suggestions:', error);
      return [];
    }
  }

  getCustomerGreeting() {
    const name = this.context.customerName || 'there';
    const messageCount = this.context.messageCount;

    if (messageCount === 0) {
      return `👋 Welcome ${name}! How can I help you today?`;
    } else if (messageCount < 5) {
      return `👋 Welcome back, ${name}! How can I assist you?`;
    } else {
      return `👋 Hello ${name}! What can I do for you today?`;
    }
  }

  getTrackingSuggestions() {
    return this.context.trackingSuggestions;
  }

  hasTrackingHistory() {
    return this.context.recentTrackingIds.length > 0;
  }

  getRecentTrackingIds() {
    return this.context.recentTrackingIds;
  }

  getContext() {
    return { ...this.context };
  }

  getCustomerName() {
    return this.context.customerName;
  }

  async endSession() {
    try {
      await this.sessionService.endSession();
      this.resetContext();
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }

  resetContext() {
    this.context = {
      customerName: null,
      recentTrackingIds: [],
      conversationHistory: [],
      trackingSuggestions: [],
      lastInteraction: null,
      messageCount: 0
    };
  }
}

let contextServiceInstance = null;

export const getCustomerContextService = () => {
  if (!contextServiceInstance) {
    contextServiceInstance = new CustomerContextService();
  }
  return contextServiceInstance;
};

export default CustomerContextService;
