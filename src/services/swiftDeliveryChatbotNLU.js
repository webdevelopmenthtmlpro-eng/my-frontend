export const SWIFT_DELIVERY_INTENTS = {
  NAVIGATE_HOME: 'navigate_home',
  NAVIGATE_GALLERY: 'navigate_gallery',
  NAVIGATE_SERVICES: 'navigate_services',
  NAVIGATE_TRACK: 'navigate_track',
  NAVIGATE_CONTACT: 'navigate_contact',
  NAVIGATE_FAQ: 'navigate_faq',
  NAVIGATE_BOOKING: 'navigate_booking',
  NAVIGATE_TESTIMONIALS: 'navigate_testimonials',
  ABOUT_SERVICES: 'about_services',
  ABOUT_TRACKING: 'about_tracking',
  ABOUT_COMPANY: 'about_company',
  PRICING_INFO: 'pricing_info',
  GENERAL_CHAT: 'general_chat',
};

export const SWIFT_SECTION_MAP = {
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_HOME]: { section: 'home', label: 'Home' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_GALLERY]: { section: 'gallery', label: 'Gallery' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_SERVICES]: { section: 'services', label: 'Services' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_TRACK]: { section: 'track', label: 'Tracking' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_CONTACT]: { section: 'contact', label: 'Contact' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_FAQ]: { section: 'faq', label: 'FAQ' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_BOOKING]: { section: 'booking', label: 'Booking' },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_TESTIMONIALS]: { section: 'testimonials', label: 'Testimonials' },
  [SWIFT_DELIVERY_INTENTS.ABOUT_SERVICES]: { section: 'services', label: 'Services Info' },
  [SWIFT_DELIVERY_INTENTS.ABOUT_TRACKING]: { section: 'track', label: 'Tracking Info' },
  [SWIFT_DELIVERY_INTENTS.ABOUT_COMPANY]: { section: 'home', label: 'Company Info' },
  [SWIFT_DELIVERY_INTENTS.PRICING_INFO]: { section: 'services', label: 'Pricing' },
};

const INTENT_PATTERNS = {
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_HOME]: {
    keywords: ['home', 'main page', 'homepage', 'start', 'beginning', 'main', 'welcome'],
    phrases: ['take me home', 'go home', 'show me home', 'go to home page'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_GALLERY]: {
    keywords: ['gallery', 'photos', 'images', 'pictures', 'portfolio', 'showcase', 'facilities', 'fleet', 'equipment'],
    phrases: ['show me gallery', 'show photos', 'view gallery', 'see our facilities', 'show equipment'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_SERVICES]: {
    keywords: ['services', 'offerings', 'what do you offer', 'capabilities', 'features', 'packages', 'airfreight', 'warehouse', 'customs'],
    phrases: ['show services', 'what services', 'tell me about services', 'service options', 'your offerings'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_TRACK]: {
    keywords: ['track', 'tracking', 'where is my', 'status', 'shipment', 'package', 'delivery', 'cargo', 'courier', 'find', 'locate', 'trace', 'monitor', 'follow', 'check', 'swift', 'has it arrived', 'when will it arrive', 'where is it', 'locate my', 'carrying'],
    phrases: [
      'track my package',
      'check tracking',
      'where is my shipment',
      'track shipment',
      'delivery status',
      'please track',
      'help me track',
      'i want to track',
      'can you track',
      'track this package',
      'track this shipment',
      'find my package',
      'find my shipment',
      'locate my package',
      'locate my shipment',
      'where is my package',
      'where is my cargo',
      'where is my parcel',
      'when will my package',
      'when will my shipment',
      'when will my delivery',
      'has my package arrived',
      'has my shipment arrived',
      'current status of',
      'package status',
      'shipment status',
      'cargo status',
      'delivery update',
      'tracking update',
      'check status',
      'trace package',
      'trace shipment',
      'trace cargo',
      'monitor package',
      'monitor shipment',
      'follow package',
      'follow shipment',
      'help track',
      'track for me',
      'please help me track',
      'can you help track',
      'i need to track',
      'need help tracking',
      'package tracking',
      'shipment tracking',
      'cargo tracking',
      'live tracking',
      'real-time tracking',
      'trace my',
      'find status of',
      'check status of',
      'what is the status',
      'what is the location',
      'show me tracking',
      'show tracking info',
      'show delivery status',
      'help with tracking',
      'tracking help',
      'track this',
      'track id',
      'tracking number',
      'reference number',
      'shipment number',
      'cargo number',
      'parcel tracking',
      'parcel status',
      'package location',
      'shipment location',
      'delivery location',
      'current location of',
      'last update on',
      'track and trace',
      'trace and track',
      'package trace',
      'shipment trace',
      'track the courier carrying',
      'track courier carrying',
      'track package carrying',
      'track the package',
    ],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_CONTACT]: {
    keywords: ['contact', 'email', 'phone', 'address', 'reach us', 'call', 'message', 'contact us', 'get in touch'],
    phrases: ['contact us', 'how to contact', 'get in touch', 'contact information', 'reach out'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_FAQ]: {
    keywords: ['faq', 'frequently asked', 'questions', 'help', 'common issues', 'troubleshoot', 'problem', 'issue'],
    phrases: ['show faq', 'frequently asked questions', 'common questions', 'help me', 'how do i'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_BOOKING]: {
    keywords: ['booking', 'book', 'reserve', 'schedule', 'send package', 'shipment', 'order', 'booking dashboard'],
    phrases: ['make booking', 'book shipment', 'schedule delivery', 'send package', 'new shipment'],
  },
  [SWIFT_DELIVERY_INTENTS.NAVIGATE_TESTIMONIALS]: {
    keywords: ['testimonial', 'reviews', 'feedback', 'customers', 'what people say', 'customer feedback', 'success stories'],
    phrases: ['show testimonials', 'customer reviews', 'what customers say', 'success stories'],
  },
  [SWIFT_DELIVERY_INTENTS.ABOUT_SERVICES]: {
    keywords: ['airfreight', 'warehouse', 'customs', 'temperature', 'dangerous goods', 'cargo', 'transport', 'logistics'],
    phrases: ['tell me about services', 'explain services', 'service details', 'what can you do'],
  },
  [SWIFT_DELIVERY_INTENTS.ABOUT_TRACKING]: {
    keywords: ['tracking system', 'real-time', 'location', 'map', 'gps', 'live tracking', 'monitoring'],
    phrases: ['how does tracking work', 'real-time tracking', 'live updates', 'location tracking'],
  },
  [SWIFT_DELIVERY_INTENTS.ABOUT_COMPANY]: {
    keywords: ['company', 'about', 'swiftdelivery', 'who are you', 'mission', 'vision', 'commitment'],
    phrases: ['tell me about swiftdelivery', 'about your company', 'who are you', 'company background'],
  },
  [SWIFT_DELIVERY_INTENTS.PRICING_INFO]: {
    keywords: ['pricing', 'cost', 'price', 'rate', 'fees', 'how much', 'expense', 'charge'],
    phrases: ['what are your prices', 'pricing', 'cost of service', 'how much does it cost'],
  },
};

export const detectSwiftDeliveryIntent = (userMessage) => {
  const normalizedMessage = userMessage.toLowerCase().trim();
  
  let highestScore = 0;
  let detectedIntent = SWIFT_DELIVERY_INTENTS.GENERAL_CHAT;
  
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
    section: SWIFT_SECTION_MAP[detectedIntent]?.section,
    label: SWIFT_SECTION_MAP[detectedIntent]?.label,
    shouldNavigate: highestScore > 0 && detectedIntent !== SWIFT_DELIVERY_INTENTS.GENERAL_CHAT,
  };
};

export const scrollToWebsiteSection = (sectionId) => {
  if (!sectionId) return false;
  
  const element = document.getElementById(sectionId);
  if (!element) {
    console.warn(`Section ${sectionId} not found`);
    return false;
  }
  
  const headerHeight = 80;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerHeight;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
  
  element.focus({ preventScroll: true });
  
  if (element.classList && !element.classList.contains('chatbot-highlight')) {
    element.classList.add('chatbot-highlight');
    setTimeout(() => {
      element.classList.remove('chatbot-highlight');
    }, 3000);
  }
  
  return true;
};

if (!document.querySelector('style[data-chatbot-highlight]')) {
  const style = document.createElement('style');
  style.setAttribute('data-chatbot-highlight', 'true');
  style.textContent = `
    @keyframes chatbot-highlight-pulse {
      0% {
        background-color: rgba(79, 70, 229, 0.1);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
      }
      100% {
        background-color: rgba(79, 70, 229, 0);
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
      }
    }
    
    .chatbot-highlight {
      animation: chatbot-highlight-pulse 1s ease-out !important;
    }
  `;
  document.head.appendChild(style);
}
