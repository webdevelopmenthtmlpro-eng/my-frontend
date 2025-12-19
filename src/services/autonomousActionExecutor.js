import { scrollToSection } from './navigationHandler.js';
import { getEnhancedNLU } from './enhancedNLU.js';

export class AutonomousActionExecutor {
  constructor() {
    this.isExecuting = false;
    this.executionQueue = [];
    this.trackingComponentRef = null;
    this.appNavigationRef = null;
  }

  setTrackingComponentRef(ref) {
    this.trackingComponentRef = ref;
  }

  setAppNavigationRef(ref) {
    this.appNavigationRef = ref;
  }

  async executeActions(actions, userId = null) {
    if (this.isExecuting) {
      this.executionQueue.push({ actions, userId });
      return { queued: true, message: 'Actions queued for execution' };
    }

    this.isExecuting = true;
    const results = [];

    try {
      for (const action of actions) {
        const result = await this.executeSingleAction(action, userId);
        results.push(result);
        
        // Small delay between actions for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error executing autonomous actions:', error);
      results.push({ success: false, error: error.message });
    } finally {
      this.isExecuting = false;
      
      // Process queued actions
      if (this.executionQueue.length > 0) {
        const next = this.executionQueue.shift();
        setTimeout(() => this.executeActions(next.actions, next.userId), 100);
      }
    }

    return { executed: true, results };
  }

  async executeSingleAction(action, userId) {
    switch (action.type) {
      case 'AUTONOMOUS_TRACKING':
        return await this.executeAutonomousTracking(action);
      
      case 'NAVIGATE_TO_TRACKING':
        return await this.executeNavigationToTracking(action);
      
      case 'AUTO_FILL_TRACKING_FORM':
        return await this.autoFillTrackingForm(action);
      
      case 'CONTEXTUAL_TRACKING_REFRESH':
        return await this.executeContextualTrackingRefresh(action);
      
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  }

  async executeAutonomousTracking(action) {
    const { trackingIds, navigateToTracking, autoFillForm, executeTracking } = action;
    const trackingId = trackingIds[0];

    try {
      console.log(`🤖 Starting autonomous tracking for ${trackingId}`);
      
      // Step 1: Navigate to tracking page
      if (navigateToTracking) {
        console.log('📍 Step 1: Navigating to tracking page...');
        await this.navigateToTrackingPage();
        console.log('✅ Step 1 complete: Navigation successful');
      }

      // Step 2: Auto-fill tracking form
      if (autoFillForm) {
        console.log('✍️ Step 2: Auto-filling tracking form...');
        await this.fillTrackingForm(trackingId);
        console.log('✅ Step 2 complete: Form filled');
      }

      // Step 3: Execute tracking search
      if (executeTracking) {
        console.log('🔍 Step 3: Triggering tracking search...');
        await this.triggerTrackingSearch(trackingId);
        console.log('✅ Step 3 complete: Search triggered');
      }

      // Emit event for UI updates
      this.emitTrackingEvent('autonomous_tracking_started', {
        trackingId,
        source: 'chatbot'
      });

      console.log(`✅ Autonomous tracking completed for ${trackingId}`);
      return {
        success: true,
        trackingId,
        message: `🔍 Tracking package ${trackingId} automatically...`,
        actions: ['navigation', 'form_fill', 'search_triggered'].filter(Boolean)
      };
    } catch (error) {
      console.error('❌ Autonomous tracking error:', error);
      return {
        success: false,
        error: error.message,
        trackingId
      };
    }
  }

  async executeNavigationToTracking(action) {
    const { route, highlightSection, autoFocus } = action;

    try {
      // Try React Router navigation first
      if (this.appNavigationRef && this.appNavigationRef.navigate) {
        await this.appNavigationRef.navigate(route);
      } else {
        // Fallback to browser Navigation
        window.location.hash = route;
      }

      // Highlight tracking section if it exists
      if (highlightSection) {
        setTimeout(() => {
          const trackingElement = document.getElementById('tracking') || 
                                document.querySelector('[data-tracking-section]') ||
                                document.querySelector('.tracking-container');
          
          if (trackingElement) {
            trackingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            trackingElement.classList.add('chatbot-highlight');
            setTimeout(() => {
              trackingElement.classList.remove('chatbot-highlight');
            }, 3000);
          }
        }, 500);
      }

      // Auto-focus on tracking input
      if (autoFocus) {
        setTimeout(() => {
          const trackingInput = document.querySelector('input[placeholder*="tracking"]') ||
                               document.querySelector('#tracking-input') ||
                               document.querySelector('input[name="trackingId"]');
          
          if (trackingInput) {
            trackingInput.focus();
            trackingInput.select();
          }
        }, 800);
      }

      return {
        success: true,
        route,
        message: `📍 Navigated to tracking page`
      };
    } catch (error) {
      console.error('Navigation error:', error);
      return {
        success: false,
        error: error.message,
        route
      };
    }
  }

  async autoFillTrackingForm(action) {
    const { trackingId, triggerSearch } = action;

    try {
      console.log(`✍️ Auto-filling tracking form with ID: ${trackingId}`);
      
      // Enhanced input field finding with multiple selectors
      const inputSelectors = [
        'input[placeholder*="tracking"]',
        'input[placeholder*="Tracking"]',
        'input[id*="tracking"]',
        'input[name*="tracking"]',
        'input[id="trackingIdInput"]',
        'input[name="trackingId"]',
        '#tracking-input',
        '#trackingIdInput',
        'input[type="text"]:not([readonly])',
        'input:not([type="hidden"]):not([readonly])'
      ];
      
      let trackingInput = null;
      for (const selector of inputSelectors) {
        trackingInput = document.querySelector(selector);
        if (trackingInput) {
          console.log(`✅ Found tracking input: ${selector}`);
          break;
        }
      }
      
      if (!trackingInput) {
        throw new Error('Tracking input field not found');
      }
      
      // Clear existing value and set new tracking ID
      trackingInput.focus();
      trackingInput.select();
      trackingInput.value = '';
      
      // Type tracking ID character by character for better UX
      for (let i = 0; i < trackingId.length; i++) {
        trackingInput.value += trackingId[i];
        trackingInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between characters
      }
      
      // Dispatch change event
      trackingInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Enhanced visual feedback
      trackingInput.classList.add('autofilled', 'chatbot-highlight');
      trackingInput.style.backgroundColor = '#e0f2fe';
      trackingInput.style.borderColor = '#3b82f6';
      
      setTimeout(() => {
        trackingInput.classList.remove('autofilled');
        trackingInput.style.backgroundColor = '';
        trackingInput.style.borderColor = '';
      }, 3000);
      
      // Trigger search if requested
      if (triggerSearch) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for visual feedback
        await this.triggerTrackingSearch(trackingId);
      }
      
      return {
        success: true,
        trackingId,
        message: `📝 Tracking ID ${trackingId} filled automatically`
      };
    } catch (error) {
      console.error('❌ Auto-fill error:', error);
      return {
        success: false,
        error: error.message,
        trackingId
      };
    }
  }

  async executeContextualTrackingRefresh(action) {
    const { trackingId, showMessage } = action;

    try {
      // Show contextual message
      if (showMessage) {
        this.emitTrackingEvent('contextual_message', {
          message: showMessage,
          trackingId
        });
      }

      // Navigate and refresh tracking
      await this.navigateToTrackingPage();
      await this.fillTrackingForm(trackingId);
      await this.triggerTrackingSearch(trackingId);

      return {
        success: true,
        trackingId,
        message: `🔄 Refreshed tracking information for ${trackingId}`
      };
    } catch (error) {
      console.error('Contextual tracking refresh error:', error);
      return {
        success: false,
        error: error.message,
        trackingId
      };
    }
  }

  async executeTrackCourierAutonomous(action) {
    const { trackingIds, openNewTab, message } = action;
    const trackingId = trackingIds && trackingIds.length > 0 ? trackingIds[0] : null;

    try {
      console.log(`🚚 Starting autonomous courier tracking for ${trackingId}`);
      
      // Get courier tracking page URL with tracking ID if provided
      const courierTrackingUrl = this.getCourierTrackingUrl(trackingId);
      
      // Show enhanced message if provided
      if (message) {
        this.emitTrackingEvent('courier_message', {
          message,
          trackingId,
          source: 'chatbot'
        });
      }
      
      // Open in new tab if requested
      if (openNewTab) {
        window.open(courierTrackingUrl, '_blank');
        console.log('✅ Opened courier tracking in new tab');
      } else {
        window.location.href = courierTrackingUrl;
      }
      
      // Emit event for UI updates
      this.emitTrackingEvent('courier_tracking_started', {
        trackingId,
        source: 'chatbot',
        newTab: openNewTab
      });
      
      console.log(`✅ Courier tracking initiated for ${trackingId}`);
      return {
        success: true,
        trackingId,
        message: message || `🚚 Opening courier tracking in new tab...`,
        newTab: openNewTab,
        url: courierTrackingUrl
      };
    } catch (error) {
      console.error('❌ Courier tracking error:', error);
      return {
        success: false,
        error: error.message,
        trackingId
      };
    }
  }

  async executeNavigateToCourierTracking(action) {
    const { route, openNewTab } = action;

    try {
      const courierTrackingUrl = this.getCourierTrackingUrl();
      
      if (openNewTab) {
        window.open(courierTrackingUrl, '_blank');
        console.log('✅ Opened courier tracking in new tab');
      } else {
        window.location.href = courierTrackingUrl;
      }

      return {
        success: true,
        route,
        message: `🚚 Navigated to courier tracking page`,
        newTab: openNewTab
      };
    } catch (error) {
      console.error('Courier tracking navigation error:', error);
      return {
        success: false,
        error: error.message,
        route
      };
    }
  }

  getCourierTrackingUrl(trackingId) {
    // Get the base URL from window location
    const baseUrl = window.location.origin;
    
    // If tracking ID is provided, add it as a query parameter
    if (trackingId) {
      return `${baseUrl}/courier-tracking.html?trackingId=${encodeURIComponent(trackingId)}`;
    }
    
    // Otherwise just go to courier tracking page
    return `${baseUrl}/courier-tracking.html`;
  }

  async navigateToTrackingPage() {
    // Check if we're already on tracking page
    const currentPath = window.location.pathname || window.location.hash;
    if (currentPath.includes('tracking')) {
      console.log('✅ Already on tracking page');
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    }

    console.log('🗺️ Navigating to tracking page');

    // Navigate using available methods
    if (this.appNavigationRef && this.appNavigationRef.navigate) {
      await this.appNavigationRef.navigate('/tracking');
    } else {
      window.location.hash = '#/tracking';
    }

    // Wait for tracking input to be available
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const trackingInput = document.querySelector('input[placeholder*="tracking"]') ||
                           document.querySelector('#tracking-input') ||
                           document.querySelector('input[name="trackingId"]');
      
      if (trackingInput) {
        console.log('✅ Tracking input found');
        return true;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.warn('⚠️ Tracking input not found after multiple attempts');
    return false;
  }

  async triggerTrackingSearch(trackingId) {
    console.log(`🔍 Triggering tracking search for ${trackingId}`);
    
    // Enhanced button finding with multiple selectors
    const searchButtons = [
      'button[type="submit"]',
      'button[onclick*="track"]',
      'button:contains("Track")',
      'button:contains("Track Shipment")',
      'button:contains("track")',
      '.track-btn',
      '#trackButton',
      'button[data-action="track"]'
    ];
    
    let searchButton = null;
    for (const selector of searchButtons) {
      searchButton = document.querySelector(selector);
      if (searchButton && !searchButton.disabled) {
        console.log(`🔍 Found search button: ${selector}`);
        break;
      }
    }
    
    if (searchButton) {
      console.log('🔍 Clicking search button');
      searchButton.click();
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    }
    
    // Alternative: Find form and submit it
    const forms = [
      'form[id="trackingForm"]',
      'form[action*="track"]',
      'form',
      '#trackingForm'
    ];
    
    let form = null;
    for (const selector of forms) {
      form = document.querySelector(selector);
      if (form) {
        console.log(`🔍 Found form: ${selector}`);
        break;
      }
    }
    
    if (form) {
      console.log('🔍 Submitting form directly');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    }
    
    // Last resort: Enhanced Enter key simulation
    const inputs = [
      'input[placeholder*="tracking"]',
      'input[id="trackingIdInput"]',
      'input[name="trackingId"]',
      '#tracking-input',
      'input[type="text"]'
    ];
    
    let input = null;
    for (const selector of inputs) {
      input = document.querySelector(selector);
      if (input && input.value.includes(trackingId)) {
        console.log(`🔍 Found input: ${selector}`);
        break;
      }
    }
    
    if (input) {
      console.log('🔍 Pressing Enter on input');
      // Simulate complete key sequence
      const events = ['keydown', 'keypress', 'keyup'];
      for (const eventType of events) {
        input.dispatchEvent(new KeyboardEvent(eventType, {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          composed: true,
          cancelable: true
        }));
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    }
    
    console.warn('❌ Could not find tracking button or form');
    return false;
  }

  emitTrackingEvent(eventType, data) {
    const event = new CustomEvent(`swiftbot_${eventType}`, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
}

// Export singleton instance
export const getAutonomousActionExecutor = () => {
  return new AutonomousActionExecutor();
};