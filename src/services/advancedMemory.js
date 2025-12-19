const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AdvancedMemory {
  constructor(authService) {
    this.authService = authService;
    this.localCache = {
      userProfile: null,
      sentimentHistory: [],
      entityCache: {},
      lastUpdate: null
    };
    this.syncInterval = 5 * 60 * 1000;
    this.startAutoSync();
  }

  async initialize(userId, email) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';
      const response = await fetch(`${API_BASE}/memory/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.localCache.userProfile = data.profile || data;
        this.localCache.lastUpdate = new Date();
        
        console.log('✅ Advanced memory initialized:', this.localCache.userProfile);
        return data.profile || data;
      }
      return null;
    } catch (error) {
      console.error('Failed to initialize advanced memory:', error);
      return null;
    }
  }

  async recordInteraction(sessionId, messageData, entities, sentiment) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';
      const userId = await this.authService.getCurrentUserId?.() || 'anonymous';
      const email = await this.authService.getCurrentUserEmail?.() || 'unknown@example.com';

      const interaction = {
        sessionId,
        userId,
        email,
        messageContent: messageData.text,
        timestamp: new Date(),
        entities: entities,
        sentiment: sentiment,
        intent: messageData.intent,
        messageId: messageData.id
      };

      const response = await fetch(
        `${API_BASE}/memory/interaction/record`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(interaction)
        }
      );

      if (response.ok) {
        const data = await response.json();
        await this.updateLocalCache(data.profile || data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to record interaction:', error);
      return null;
    }
  }

  async updateLocalCache(profileData) {
    this.localCache.userProfile = profileData;
    this.localCache.lastUpdate = new Date();
    
    if (profileData.sentimentHistory) {
      this.localCache.sentimentHistory = profileData.sentimentHistory;
    }
  }

  async recordSentiment(userId, sessionId, messageId, sentimentData) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';

      const sentimentRecord = {
        userId,
        sessionId,
        messageId,
        sentiment: {
          primary: sentimentData.primary,
          confidence: sentimentData.confidence,
          emotions: sentimentData.emotions,
          emotionScores: sentimentData.emotionScores
        },
        triggerContext: {
          messageContent: sentimentData.messageContent,
          intent: sentimentData.intent,
          previousSentiment: this.getPreviousSentiment()
        },
        analysis: sentimentData.analysis,
        timestamp: new Date()
      };

      const response = await fetch(
        `${API_BASE}/memory/sentiment/record`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sentimentRecord)
        }
      );

      if (response.ok) {
        this.localCache.sentimentHistory.push(sentimentRecord);
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to record sentiment:', error);
      return null;
    }
  }

  getPreviousSentiment() {
    if (this.localCache.sentimentHistory.length > 0) {
      return this.localCache.sentimentHistory[this.localCache.sentimentHistory.length - 1].sentiment.primary;
    }
    return 'neutral';
  }

  async enrichUserProfile(userId, entityData) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';

      const enrichment = {
        userId,
        entities: {
          emails: entityData.emails || [],
          phoneNumbers: entityData.phoneNumbers || [],
          destinations: entityData.destinations || [],
          names: entityData.names || [],
          packageCounts: entityData.packageCounts || []
        },
        timestamp: new Date()
      };

      const response = await fetch(
        `${API_BASE}/memory/profile/enrich`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enrichment)
        }
      );

      if (response.ok) {
        const data = await response.json();
        await this.updateLocalCache(data.profile || data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to enrich user profile:', error);
      return null;
    }
  }

  async getPersonalizationContext(userId) {
    try {
      if (this.localCache.userProfile && 
          this.localCache.lastUpdate && 
          (Date.now() - this.localCache.lastUpdate.getTime()) < 60000) {
        return this.localCache.userProfile;
      }

      const token = await this.authService.getIdToken?.() || 'dummy-token';
      const response = await fetch(
        `${API_BASE}/memory/context/personalization/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        this.localCache.userProfile = data;
        this.localCache.lastUpdate = new Date();
        return data;
      }
      return this.localCache.userProfile;
    } catch (error) {
      console.error('Failed to get personalization context:', error);
      return this.localCache.userProfile;
    }
  }

  async getSentimentTrend(userId, days = 30) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';
      const response = await fetch(
        `${API_BASE}/memory/sentiment/trend/${userId}?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get sentiment trend:', error);
      return null;
    }
  }

  async getSuccessfulResolutions(userId) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';
      const response = await fetch(
        `${API_BASE}/memory/resolutions/successful/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get successful resolutions:', error);
      return null;
    }
  }

  async recordResolution(userId, issue, resolutionMethod, sentiment) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';

      const resolution = {
        userId,
        issue,
        resolutionMethod,
        sentiment: sentiment.primary,
        timestamp: new Date()
      };

      const response = await fetch(
        `${API_BASE}/memory/resolution/record`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resolution)
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to record resolution:', error);
      return null;
    }
  }

  async updateBehaviorPattern(userId, intent, success = true) {
    try {
      const token = await this.authService.getIdToken?.() || 'dummy-token';

      const pattern = {
        userId,
        intent,
        success,
        timestamp: new Date()
      };

      const response = await fetch(
        `${API_BASE}/memory/behavior/update`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pattern)
        }
      );

      if (response.ok) {
        const data = await response.json();
        await this.updateLocalCache(data.profile || data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update behavior pattern:', error);
      return null;
    }
  }

  async getProactiveRecommendations(userId) {
    try {
      const context = await this.getPersonalizationContext(userId);
      
      if (!context) return null;

      const recommendations = [];

      if (context.behaviorPatterns.trackingFrequency > 3) {
        recommendations.push({
          type: 'tracking_habit',
          message: 'You frequently track shipments. Quick tracking enabled.',
          action: 'enable_quick_tracking'
        });
      }

      if (context.complaintHistory.complaintTrend === 'increasing') {
        recommendations.push({
          type: 'escalation_notice',
          message: 'We\'ve noticed an increase in issues. Our support team is ready to help.',
          action: 'offer_support'
        });
      }

      if (context.sentimentProfile.overallSentiment === 'negative') {
        recommendations.push({
          type: 'sentiment_recovery',
          message: 'We\'d like to improve your experience. Can we help?',
          action: 'offer_resolution'
        });
      }

      const mostSuccess = context.resolutionHistory.successfulResolutions[0];
      if (mostSuccess) {
        recommendations.push({
          type: 'pattern_based',
          message: `Based on your history, we can help with ${mostSuccess.issue}`,
          action: 'offer_common_solution'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Failed to get proactive recommendations:', error);
      return [];
    }
  }

  async startAutoSync() {
    setInterval(async () => {
      const userId = await this.authService.getCurrentUserId?.();
      if (userId) {
        await this.getPersonalizationContext(userId);
        console.log('🔄 Advanced memory auto-synced');
      }
    }, this.syncInterval);
  }

  getLocalCache() {
    return this.localCache;
  }

  clearLocalCache() {
    this.localCache = {
      userProfile: null,
      sentimentHistory: [],
      entityCache: {},
      lastUpdate: null
    };
  }
}

export default AdvancedMemory;
