export class ConversationContext {
  constructor() {
    this.history = [];
    this.currentIntent = null;
    this.context = {};
    this.maxHistoryLength = 10;
  }

  addMessage(message, intent, metadata = {}) {
    this.history.push({
      message,
      intent,
      timestamp: Date.now(),
      metadata,
    });

    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    this.currentIntent = intent;
  }

  getContext() {
    return {
      currentIntent: this.currentIntent,
      lastMessages: this.history.slice(-3),
      context: this.context,
    };
  }

  setContextData(key, value) {
    this.context[key] = value;
  }

  getContextData(key) {
    return this.context[key];
  }

  clearContext() {
    this.history = [];
    this.currentIntent = null;
    this.context = {};
  }

  getMessageHistory() {
    return this.history;
  }

  hasRecentIntent(intent, timeWindowMs = 5000) {
    const now = Date.now();
    return this.history.some(
      (entry) =>
        entry.intent === intent && (now - entry.timestamp) < timeWindowMs
    );
  }

  getFollowUpSuggestions() {
    const suggestions = {
      navigate_home: ["Check our gallery", "Learn about services"],
      navigate_services: ["View pricing", "Book a shipment"],
      navigate_track: ["Track another package", "Contact support"],
      navigate_contact: ["View gallery", "Check FAQ"],
    };

    return suggestions[this.currentIntent] || [];
  }
}

let conversationContext = null;

export const getConversationContext = () => {
  if (!conversationContext) {
    conversationContext = new ConversationContext();
  }
  return conversationContext;
};

export const resetConversationContext = () => {
  conversationContext = new ConversationContext();
};
