import { detectSwiftDeliveryIntent } from './swiftDeliveryChatbotNLU.js';
import { getConversationContext } from './conversationContext.js';
import { getCustomerContextService } from './customerContextService.js';

export const ENHANCED_INTENTS = {
  ...detectSwiftDeliveryIntent?.INTENTS || {},
  TRACK_PACKAGE_SPECIFIC: 'track_package_specific',
  TRACK_BY_ID: 'track_by_id',
  TRACK_BY_NAME: 'track_by_name',
  NAVIGATE_TO_TRACKING: 'navigate_to_tracking',
  AUTONOMOUS_TRACKING: 'autonomous_tracking',
  FOLLOW_UP_TRACKING: 'follow_up_tracking',
  STATUS_INQUIRY: 'status_inquiry',
  LOCATION_INQUIRY: 'location_inquiry',
  DELIVERY_TIME_INQUIRY: 'delivery_time_inquiry',
  MULTIPLE_PACKAGE_TRACKING: 'multiple_package_tracking',
  TRACK_COURIER: 'track_courier',
  TRACK_COURIER_AUTONOMOUS: 'track_courier_autonomous'
};

export const ENTITY_PATTERNS = {
  TRACKING_ID: {
    patterns: [
      /\b[A-Z]{2,}-\d{10,}-[A-Z]{3,}\b/gi, // SWIFT-1764838531166-A36MZ
      /\b[A-Z]{2,}-\d{8,}-[A-Z]{3,}\b/gi, // SWIFT-1234567890-ABCDE
      /\b[A-Z]{3,}\d{6,}[A-Z]{2,}\b/gi, // SWF123456AB
      /\b\d{10,}\b/g, // Pure numbers (10+ digits)
      /\b[A-Z0-9]{8,}-\d{4,}\b/gi, // Mixed format
      /\bSWIFT-[\w-]+\b/gi, // Any SWIFT-* format
      // Enhanced patterns for your specific examples
      /\btrack\s+(?:this\s+)?(?:item|package|shipment|cargo|parcel)\s+(?:swift\s+)?([A-Z0-9-]+)\b/gi,
      /\btrack\s+(?:this\s+)?(?:item|package|shipment|cargo|parcel)\s+([A-Z0-9-]+)\b/gi,
      /\btrack\s+(?:this\s+)?(?:item|package|shipment|cargo|parcel)\s+swift\s+([A-Z0-9-]+)\b/gi,
    ],
    examples: ['SWIFT-1764838531166-A36MZ', 'SWIFT-1234567890-ABCDE', 'SWF123456AB', '1234567890', 'track this item swift fhksdkvj', 'track this package swift rfkabfjsbvc']
  },
  
  PACKAGE_STATUS: {
    patterns: [
      /\b(delivered|out for delivery|in transit|pending|pickup|failed|returned)\b/gi,
      /\b(package|shipment|delivery|cargo|parcel)\s+(status|location|where|when)\b/gi
    ],
    examples: ['delivered', 'out for delivery', 'in transit']
  },

  COURIER_KEYWORDS: {
    patterns: [
      /\b(courier|delivery agent|rider|driver|logistics partner)\b/gi,
      /\b(track.*courier|courier.*track)\b/gi,
      // Enhanced patterns for courier-specific tracking
      /\btrack\s+(?:this\s+)?courier\b/gi,
      /\btrack\s+courier\b/gi,
      /\bcourier\s+tracking\b/gi,
      /\btrack\s+(?:this\s+)?(?:delivery\s+)?(?:agent|rider|driver)\b/gi
    ],
    examples: ['track this courier', 'track courier', 'track this delivery agent', 'track this rider', 'courier tracking']
  },

  PACKAGE_KEYWORDS: {
    patterns: [
      /\b(track.*package|package.*track|my package|track shipment|track cargo)\b/gi,
      /\b(parcel|shipment|cargo|goods|items?)\b/gi
    ],
    examples: ['track package', 'my shipment', 'parcel tracking']
  },

  LOCATION_ENTITIES: {
    patterns: [
      /\b(at|in|near|around)\s+([a-z\s]+?)(?:\s+(?:office|hub|facility|location|center))/gi,
      /\b(address|location|place|where)\s+(is|are)\s+([a-z\s]+)/gi
    ]
  },

  TIME_EXPRESSIONS: {
    patterns: [
      /\b(today|tomorrow|yesterday|now|current|latest|recent|soon|asap|immediately)\b/gi,
      /\b(\d{1,2}\s*(?:am|pm|o'clock))\b/gi,
      /\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b/gi
    ]
  },

  CUSTOMER_NAMES: {
    patterns: [
      /\b(my|i'm|for)\s+([a-z]+(?:\s+[a-z]+)?)\s+(package|shipment|delivery)/gi,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)'s\s+(package|shipment|delivery)/gi
    ]
  }
};

export class EnhancedNLUProcessor {
  constructor() {
    this.context = getConversationContext();
    this.customerContext = getCustomerContextService();
    this.confidenceThreshold = 0.6;
    this.entityCache = new Map();
  }

  async processMessage(userMessage, userId = null) {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Step 1: Extract entities first
    const entities = this.extractEntities(normalizedMessage);
    
    // Step 2: Enhanced intent detection with context
    const intentResult = this.detectEnhancedIntent(normalizedMessage, entities);
    
    // Step 3: Apply conversation context
    const contextualizedResult = this.applyConversationContext(intentResult, entities);
    
    // Step 4: Check for smart tracking suggestions from history
    const trackingSuggestions = this.checkTrackingHistory(normalizedMessage);
    
    // Step 5: Generate autonomous actions
    const actions = await this.generateAutonomousActions(contextualizedResult, entities, userId);
    
    // Step 6: Update conversation context
    this.updateConversationContext(userMessage, contextualizedResult, entities);
    
    // Step 7: Save to customer context (MongoDB)
    try {
      await this.customerContext.updateContextWithMessage(userMessage, 'customer');
    } catch (error) {
      console.warn('Failed to save context:', error);
    }
    
    return {
      ...contextualizedResult,
      entities,
      actions,
      trackingSuggestions,
      timestamp: Date.now(),
      userId
    };
  }

  extractEntities(message) {
    const entities = {
      trackingIds: [],
      statusKeywords: [],
      locations: [],
      timeExpressions: [],
      customerNames: [],
      hasTrackingPhrase: false,
      hasCourierKeyword: false,
      hasPackageKeyword: false,
      confidence: {}
    };

    // Check for tracking phrases
    const trackingPhrases = [
      'track', 'tracking', 'where is', 'locate', 'find', 'trace', 'monitor', 'follow',
      'status', 'shipment', 'package', 'cargo', 'delivery', 'check', 'have you', 
      'can you', 'help me', 'please', 'need to', 'want to', 'arrive', 'arrived'
    ];
    const hasPhrase = trackingPhrases.some(phrase => message.includes(phrase));
    if (hasPhrase) {
      entities.hasTrackingPhrase = true;
    }

    // Extract courier keywords
    ENTITY_PATTERNS.COURIER_KEYWORDS.patterns.forEach(pattern => {
      if (pattern.test(message)) {
        entities.hasCourierKeyword = true;
        entities.confidence.courier = 0.9;
      }
    });

    // Extract package keywords
    ENTITY_PATTERNS.PACKAGE_KEYWORDS.patterns.forEach(pattern => {
      if (pattern.test(message)) {
        entities.hasPackageKeyword = true;
        entities.confidence.package = 0.9;
      }
    });

    // Extract tracking IDs
    ENTITY_PATTERNS.TRACKING_ID.patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        const cleanMatches = matches.map(m => m.trim()).filter(m => m.length > 0);
        entities.trackingIds.push(...cleanMatches);
        entities.confidence.trackingIds = 0.95; // Higher confidence when ID found
      }
    });

    // Extract status keywords
    ENTITY_PATTERNS.PACKAGE_STATUS.patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.statusKeywords.push(...matches.map(m => m.toLowerCase()));
        entities.confidence.statusKeywords = 0.8;
      }
    });

    // Extract locations
    ENTITY_PATTERNS.LOCATION_ENTITIES.patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.locations.push(...matches);
        entities.confidence.locations = 0.7;
      }
    });

    // Extract time expressions
    ENTITY_PATTERNS.TIME_EXPRESSIONS.patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.timeExpressions.push(...matches);
        entities.confidence.timeExpressions = 0.8;
      }
    });

    // Extract customer names
    ENTITY_PATTERNS.CUSTOMER_NAMES.patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.customerNames.push(...matches);
        entities.confidence.customerNames = 0.6;
      }
    });

    return entities;
  }

  detectEnhancedIntent(message, entities) {
    // Base intent detection
    const baseIntent = detectSwiftDeliveryIntent(message);
    
    // Enhanced intent logic with entity consideration
    let enhancedIntent = baseIntent.intent;
    let confidence = baseIntent.confidence;
    let shouldNavigate = baseIntent.shouldNavigate;

    // Enhanced pattern matching for your specific examples
    const isTrackThisItemSwift = /\btrack\s+(?:this\s+)?(?:item|package|shipment|cargo|parcel)\s+(?:swift\s+)?([A-Z0-9-]+)\b/gi.test(message);
    const isTrackThisPackageSwift = /\btrack\s+(?:this\s+)?(?:package|shipment|cargo|parcel)\s+swift\s+([A-Z0-9-]+)\b/gi.test(message);
    const isTrackCourierOnly = /\btrack\s+(?:this\s+)?courier\b/gi.test(message) || /\btrack\s+courier\b/gi.test(message);
    
    // COURIER TRACKING - Enhanced detection for courier-specific requests
    if (entities.hasCourierKeyword || isTrackCourierOnly) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_COURIER_AUTONOMOUS;
      confidence = 0.99; // Highest confidence for courier tracking
      shouldNavigate = false; // Don't navigate to tracking page, will open new tab instead
    }
    // Enhanced "track this item swift XXX" pattern detection
    else if (isTrackThisItemSwift || isTrackThisPackageSwift) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_BY_ID;
      confidence = 0.99; // Highest confidence for specific pattern
      shouldNavigate = true; // Navigate to tracking section on same page
    }
    // COURIER TRACKING with explicit phrase (still high confidence)
    else if (entities.hasCourierKeyword && entities.hasTrackingPhrase) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_COURIER_AUTONOMOUS;
      confidence = 0.98; // High confidence for courier + tracking phrase
      shouldNavigate = false; // Open new tab for courier tracking
    }
    // Courier tracking with just keyword (still high confidence)
    else if (entities.hasCourierKeyword && message.toLowerCase().includes('track')) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_COURIER;
      confidence = 0.95;
      shouldNavigate = false;
    }
    // Autonomous package tracking detection (highest priority for package tracking)
    else if (entities.trackingIds.length > 0 && entities.hasTrackingPhrase && !entities.hasCourierKeyword) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_BY_ID;
      confidence = 0.99; // Highest confidence when tracking ID + phrase found
      shouldNavigate = true;
    }
    // Tracking ID without explicit phrase (still strong signal)
    else if (entities.trackingIds.length > 0 && !entities.hasCourierKeyword) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_BY_ID;
      confidence = 0.98; // Very high confidence for ID alone
      shouldNavigate = true;
    } 
    // Tracking phrase with base intent detection
    else if (baseIntent.intent === ENHANCED_INTENTS.NAVIGATE_TRACK && entities.hasTrackingPhrase) {
      enhancedIntent = ENHANCED_INTENTS.NAVIGATE_TO_TRACKING;
      confidence = Math.max(baseIntent.confidence, 0.9);
      shouldNavigate = true;
    }
    // Tracking phrase detected even if base intent missed it
    else if (entities.hasTrackingPhrase && !baseIntent.shouldNavigate) {
      enhancedIntent = ENHANCED_INTENTS.NAVIGATE_TO_TRACKING;
      confidence = 0.88;
      shouldNavigate = true;
    }
    // Customer name tracking
    else if (entities.customerNames.length > 0 && 
               (message.includes('track') || message.includes('where') || message.includes('status'))) {
      enhancedIntent = ENHANCED_INTENTS.TRACK_BY_NAME;
      confidence = 0.85;
      shouldNavigate = true;
    } 
    // Status inquiry
    else if (entities.statusKeywords.length > 0 && 
               (message.includes('what') || message.includes('current'))) {
      enhancedIntent = ENHANCED_INTENTS.STATUS_INQUIRY;
      confidence = 0.8;
    } 
    // Location inquiry
    else if (message.includes('where') && entities.trackingIds.length === 0) {
      enhancedIntent = ENHANCED_INTENTS.LOCATION_INQUIRY;
      confidence = 0.75;
    } 
    // Delivery time inquiry
    else if (message.includes('when') && (message.includes('deliver') || message.includes('arrive'))) {
      enhancedIntent = ENHANCED_INTENTS.DELIVERY_TIME_INQUIRY;
      confidence = 0.8;
    }

    // Follow-up detection based on context
    const recentIntents = this.context.getMessageHistory().slice(-3);
    const hasRecentTracking = recentIntents.some(msg => 
      msg.intent?.includes('track') || msg.intent?.includes('navigate_track')
    );

    if (hasRecentTracking && 
        (message.includes('again') || message.includes('also') || message.includes('another'))) {
      enhancedIntent = ENHANCED_INTENTS.FOLLOW_UP_TRACKING;
      confidence = 0.9;
    }

    return {
      intent: enhancedIntent,
      confidence,
      shouldNavigate,
      originalIntent: baseIntent.intent,
      entities: entities
    };
  }

  checkTrackingHistory(normalizedMessage) {
    try {
      const customerCtx = this.customerContext.getContext();
      const suggestions = customerCtx.trackingSuggestions || [];
      
      if (suggestions.length === 0) return [];
      
      const trackingKeywords = ['track', 'where', 'status', 'delivery', 'package', 'shipment'];
      const hasTrackingIntent = trackingKeywords.some(kw => normalizedMessage.includes(kw));
      
      if (!hasTrackingIntent) return [];
      
      const recentIds = customerCtx.recentTrackingIds || [];
      const smartSuggestions = suggestions
        .filter(s => recentIds.includes(s.trackingId))
        .slice(0, 3)
        .map(s => ({
          trackingId: s.trackingId,
          status: s.status,
          lastTracked: s.lastTracked,
          confidence: 0.9
        }));
      
      return smartSuggestions;
    } catch (error) {
      console.warn('Error checking tracking history:', error);
      return [];
    }
  }

  applyConversationContext(intentResult, entities) {
    const context = this.context.getContext();
    const result = { ...intentResult };

    // Contextual enhancement
    if (context.currentIntent?.includes('track') && 
        entities.trackingIds.length === 0 && 
        entities.customerNames.length === 0) {
      // User is likely referring to the same package
      result.contextualTracking = true;
      result.confidence = Math.max(result.confidence, 0.7);
    }

    // Memory-based suggestions
    if (context.lastMessages?.length > 0) {
      const lastTrackingMessage = context.lastMessages.find(msg => 
        msg.metadata?.trackingId || msg.metadata?.trackingData
      );
      
      if (lastTrackingMessage) {
        result.recentTrackingContext = {
          trackingId: lastTrackingMessage.metadata?.trackingId,
          timestamp: lastTrackingMessage.timestamp
        };
      }
    }

    return result;
  }

  async generateAutonomousActions(intentResult, entities, userId) {
    const actions = [];

    // Enhanced courier tracking action (opens new tab)
    if (intentResult.intent === ENHANCED_INTENTS.TRACK_COURIER_AUTONOMOUS) {
      // Extract tracking ID from message if present
      const trackingIdMatch = message.match(/\b([A-Z0-9-]{8,})\b/gi);
      const trackingId = trackingIdMatch ? trackingIdMatch[1] : null;
      
      actions.push({
        type: 'TRACK_COURIER_AUTONOMOUS',
        trackingIds: trackingId ? [trackingId] : entities.trackingIds,
        openNewTab: true,
        message: trackingId ? `🚚 Opening courier tracking for ${trackingId} in new tab...` : '🚚 Opening courier tracking page...'
      });
    }
    // Navigate to courier tracking page
    else if (intentResult.intent === ENHANCED_INTENTS.TRACK_COURIER) {
      actions.push({
        type: 'NAVIGATE_TO_COURIER_TRACKING',
        route: '/courier-tracking',
        openNewTab: true,
        message: '🚚 Opening courier tracking page in new tab...'
      });
    }
    // Enhanced autonomous package tracking action with better extraction
    else if (intentResult.intent === ENHANCED_INTENTS.TRACK_BY_ID && entities.trackingIds.length > 0) {
      // Try to extract the most specific tracking ID from the message
      const specificMatch = message.match(/\btrack\s+(?:this\s+)?(?:item|package|shipment|cargo|parcel)\s+(?:swift\s+)?([A-Z0-9-]+)\b/gi);
      const trackingId = specificMatch ? specificMatch[1] : entities.trackingIds[0];
      
      actions.push({
        type: 'AUTONOMOUS_TRACKING',
        trackingIds: [trackingId],
        navigateToTracking: true,
        autoFillForm: true,
        executeTracking: true,
        message: `🔍 Tracking package ${trackingId} automatically...`
      });
    }

    // Navigation to tracking page for package tracking
    if (intentResult.shouldNavigate && intentResult.intent.includes('track') && !intentResult.intent.includes('courier')) {
      actions.push({
        type: 'NAVIGATE_TO_TRACKING',
        route: '/tracking',
        highlightSection: true,
        autoFocus: true
      });
    }

    // Contextual follow-up actions
    if (intentResult.contextualTracking && intentResult.recentTrackingContext) {
      actions.push({
        type: 'CONTEXTUAL_TRACKING_REFRESH',
        trackingId: intentResult.recentTrackingContext.trackingId,
        showMessage: 'Checking for updates on your recent package...'
      });
    }

    // Auto-fill tracking form for package tracking
    if (entities.trackingIds.length > 0 && !intentResult.intent.includes('courier')) {
      actions.push({
        type: 'AUTO_FILL_TRACKING_FORM',
        trackingId: entities.trackingIds[0],
        triggerSearch: true
      });
    }

    return actions;
  }

  updateConversationContext(message, intentResult, entities) {
    const metadata = {
      entities,
      confidence: intentResult.confidence,
      trackingId: entities.trackingIds[0] || null,
      trackingData: entities.trackingIds.length > 0 ? { requested: true } : null
    };

    this.context.addMessage(message, intentResult.intent, metadata);
    
    // Store important context data
    if (entities.trackingIds.length > 0) {
      this.context.setContextData('lastTrackingId', entities.trackingIds[0]);
      this.context.setContextData('lastTrackingRequest', Date.now());
    }
  }

  // Memory persistence methods
  async saveConversationToStorage(userId) {
    try {
      const contextData = {
        history: this.context.getMessageHistory(),
        contextData: this.context.context,
        timestamp: Date.now(),
        userId
      };
      
      localStorage.setItem(`swift_chat_${userId}`, JSON.stringify(contextData));
      return true;
    } catch (error) {
      console.error('Failed to save conversation context:', error);
      return false;
    }
  }

  async loadConversationFromStorage(userId) {
    try {
      const stored = localStorage.getItem(`swift_chat_${userId}`);
      if (stored) {
        const contextData = JSON.parse(stored);
        
        // Restore conversation history
        contextData.history.forEach(msg => {
          this.context.addMessage(msg.message, msg.intent, msg.metadata);
        });
        
        // Restore context data
        Object.entries(contextData.contextData || {}).forEach(([key, value]) => {
          this.context.setContextData(key, value);
        });
        
        return true;
      }
    } catch (error) {
      console.error('Failed to load conversation context:', error);
    }
    return false;
  }

  getFollowUpSuggestions(intent) {
    const suggestions = {
      [ENHANCED_INTENTS.TRACK_BY_ID]: [
        'Show me delivery details',
        'When will it arrive?',
        'Track another package'
      ],
      [ENHANCED_INTENTS.NAVIGATE_TO_TRACKING]: [
        'Enter tracking ID',
        'Track by name',
        'Help with tracking'
      ],
      [ENHANCED_INTENTS.STATUS_INQUIRY]: [
        'Show location on map',
        'Contact support',
        'Track another package'
      ],
      [ENHANCED_INTENTS.FOLLOW_UP_TRACKING]: [
        'Check another package',
        'Set delivery alerts',
        'Contact courier'
      ]
    };

    return suggestions[intent] || [
      'Track a package',
      'Check delivery status',
      'Contact support'
    ];
  }
}

// Singleton instance
let enhancedNLUInstance = null;

export const getEnhancedNLU = () => {
  if (!enhancedNLUInstance) {
    enhancedNLUInstance = new EnhancedNLUProcessor();
  }
  return enhancedNLUInstance;
};

export default EnhancedNLUProcessor;
