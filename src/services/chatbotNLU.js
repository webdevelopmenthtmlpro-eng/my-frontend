export const INTENTS = {
  NAVIGATE_HOME: 'navigate_home',
  NAVIGATE_GALLERY: 'navigate_gallery',
  NAVIGATE_SERVICES: 'navigate_services',
  NAVIGATE_TRACK: 'navigate_track',
  NAVIGATE_CONTACT: 'navigate_contact',
  NAVIGATE_FAQ: 'navigate_faq',
  NAVIGATE_PRICING: 'navigate_pricing',
  NAVIGATE_BOOKING: 'navigate_booking',
  NAVIGATE_LOGIN: 'navigate_login',
  NAVIGATE_REGISTER: 'navigate_register',
  GET_HELP: 'get_help',
  TRACK_PACKAGE: 'track_package',
  ABOUT_SERVICES: 'about_services',
  GENERAL_CHAT: 'general_chat',
};

export const SECTION_MAP = {
  [INTENTS.NAVIGATE_HOME]: { section: 'home', label: 'Home' },
  [INTENTS.NAVIGATE_GALLERY]: { section: 'gallery', label: 'Gallery' },
  [INTENTS.NAVIGATE_SERVICES]: { section: 'services', label: 'Services' },
  [INTENTS.NAVIGATE_TRACK]: { section: 'track', label: 'Tracking' },
  [INTENTS.NAVIGATE_CONTACT]: { section: 'contact', label: 'Contact' },
  [INTENTS.NAVIGATE_FAQ]: { section: 'faq', label: 'FAQ' },
  [INTENTS.NAVIGATE_BOOKING]: { section: 'booking', label: 'Booking' },
  [INTENTS.NAVIGATE_PRICING]: { section: 'services', label: 'Pricing' },
  [INTENTS.NAVIGATE_LOGIN]: { section: null, route: '/login', label: 'Login' },
  [INTENTS.NAVIGATE_REGISTER]: { section: null, route: '/register', label: 'Register' },
};

const INTENT_PATTERNS = {
  [INTENTS.NAVIGATE_HOME]: {
    keywords: ['home', 'main page', 'homepage', 'start', 'beginning', 'main'],
    phrases: ['take me home', 'go home', 'show me home'],
  },
  [INTENTS.NAVIGATE_GALLERY]: {
    keywords: ['gallery', 'photos', 'images', 'pictures', 'portfolio', 'showcase'],
    phrases: ['show me gallery', 'show photos', 'view gallery'],
  },
  [INTENTS.NAVIGATE_SERVICES]: {
    keywords: ['services', 'offerings', 'what do you offer', 'capabilities', 'features', 'packages'],
    phrases: ['show services', 'what services', 'tell me about services', 'service options'],
  },
  [INTENTS.NAVIGATE_TRACK]: {
    keywords: ['track', 'tracking', 'where is my', 'status', 'shipment', 'package', 'delivery'],
    phrases: ['track my package', 'check tracking', 'where is my shipment', 'track shipment'],
  },
  [INTENTS.NAVIGATE_CONTACT]: {
    keywords: ['contact', 'email', 'phone', 'address', 'reach us', 'call', 'message'],
    phrases: ['contact us', 'how to contact', 'get in touch', 'contact information'],
  },
  [INTENTS.NAVIGATE_FAQ]: {
    keywords: ['faq', 'frequently asked', 'questions', 'help', 'common issues', 'troubleshoot'],
    phrases: ['show faq', 'frequently asked questions', 'common questions'],
  },
  [INTENTS.NAVIGATE_BOOKING]: {
    keywords: ['booking', 'book', 'reserve', 'schedule', 'reserve shipment', 'send package'],
    phrases: ['make booking', 'book shipment', 'schedule delivery', 'send package'],
  },
  [INTENTS.NAVIGATE_LOGIN]: {
    keywords: ['login', 'log in', 'sign in', 'signin', 'account', 'sign-in'],
    phrases: ['login', 'sign in', 'log in to account', 'access account'],
  },
  [INTENTS.NAVIGATE_REGISTER]: {
    keywords: ['register', 'sign up', 'signup', 'create account', 'join', 'new user'],
    phrases: ['sign up', 'register', 'create account', 'new account', 'join now'],
  },
  [INTENTS.TRACK_PACKAGE]: {
    keywords: ['track', 'tracking', 'shipment', 'package', 'delivery', 'status', 'where'],
    phrases: ['track package', 'track shipment', 'where is my order'],
  },
  [INTENTS.ABOUT_SERVICES]: {
    keywords: ['pricing', 'cost', 'price', 'rate', 'fees', 'how much', 'expense'],
    phrases: ['what are your prices', 'pricing', 'cost of service'],
  },
};

export const detectIntent = (userMessage) => {
  const normalizedMessage = userMessage.toLowerCase().trim();
  
  let highestScore = 0;
  let detectedIntent = INTENTS.GENERAL_CHAT;
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    const { keywords, phrases } = patterns;
    
    let score = 0;
    
    phrases.forEach((phrase) => {
      if (normalizedMessage.includes(phrase)) {
        score += 10;
      }
    });
    
    keywords.forEach((keyword) => {
      if (normalizedMessage.includes(keyword)) {
        score += 1;
      }
    });
    
    if (score > highestScore) {
      highestScore = score;
      detectedIntent = intent;
    }
  }
  
  return {
    intent: detectedIntent,
    confidence: Math.min(highestScore / 10, 1),
    section: SECTION_MAP[detectedIntent]?.section,
    route: SECTION_MAP[detectedIntent]?.route,
    label: SECTION_MAP[detectedIntent]?.label,
  };
};

export const generateResponse = (intent, userMessage) => {
  const responseMap = {
    [INTENTS.NAVIGATE_HOME]: "Let me take you to the home page! 🏠",
    [INTENTS.NAVIGATE_GALLERY]: "Showing you our gallery now! 📸",
    [INTENTS.NAVIGATE_SERVICES]: "Let me show you all our services! 📋",
    [INTENTS.NAVIGATE_TRACK]: "Let's track your package! 📦",
    [INTENTS.NAVIGATE_CONTACT]: "Here's how you can reach us! 📞",
    [INTENTS.NAVIGATE_FAQ]: "Here are our frequently asked questions! ❓",
    [INTENTS.NAVIGATE_BOOKING]: "Let's book a shipment for you! ✈️",
    [INTENTS.NAVIGATE_LOGIN]: "Redirecting you to login! 🔐",
    [INTENTS.NAVIGATE_REGISTER]: "Let's create your account! 📝",
    [INTENTS.TRACK_PACKAGE]: "I'll help you track your package right away! 📦",
    [INTENTS.ABOUT_SERVICES]: "Let me show you our service options and pricing! 💰",
    [INTENTS.GET_HELP]: "How can I help you today? 😊",
    [INTENTS.GENERAL_CHAT]: "I understand! How else can I assist you? 😊",
  };
  
  return responseMap[intent] || responseMap[INTENTS.GENERAL_CHAT];
};
