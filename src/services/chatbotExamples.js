export const chatbotExamples = [
  {
    category: "Navigation",
    examples: [
      "Show me the gallery",
      "Take me to services",
      "Where can I track my package?",
      "Contact information please",
      "What about your pricing?",
      "Show FAQ",
      "How do I book a shipment?",
      "I need to login",
      "Create a new account",
    ],
  },
  {
    category: "Tracking",
    examples: [
      "Track my package",
      "Where is my shipment?",
      "Check delivery status",
      "Track order",
    ],
  },
  {
    category: "Services",
    examples: [
      "Tell me about your services",
      "What services do you offer?",
      "Pricing information",
      "Service options",
    ],
  },
  {
    category: "Support",
    examples: [
      "I need help",
      "Help me with something",
      "Common questions",
      "How do I...",
    ],
  },
];

export const charabotTips = [
  "Ask about any section of the website naturally",
  "Use phrases like 'show me', 'take me to', 'where can I'",
  "You can ask about services, pricing, or how to track packages",
  "The chatbot understands multiple variations of the same question",
  "Navigation happens automatically after the bot responds",
];

export const testChatbotIntent = (message) => {
  const { detectIntent } = require('./chatbotNLU');
  const result = detectIntent(message);
  return {
    message,
    ...result,
  };
};
