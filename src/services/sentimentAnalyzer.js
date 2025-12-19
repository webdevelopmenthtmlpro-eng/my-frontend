class SentimentAnalyzer {
  constructor() {
    this.positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
      'perfect', 'love', 'happy', 'pleased', 'satisfied', 'thanks', 'thank', 'appreciate',
      'grateful', 'brilliant', 'cool', 'nice', 'glad', 'joy', 'comfortable', 'helped',
      'working', 'resolved', 'fixed', 'solved', 'quick', 'fast', 'efficient', 'smooth',
      'easy', 'simple', 'best', 'better', 'improving', 'improved'
    ]);

    this.negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'useless', 'hate', 'angry', 'frustrated',
      'annoyed', 'upset', 'disappointed', 'confused', 'lost', 'broken', 'failed', 'error',
      'problem', 'issue', 'complaint', 'complain', 'worst', 'waste', 'rubbish', 'garbage',
      'unacceptable', 'ridiculous', 'pathetic', 'pathetic', 'scam', 'fraud', 'angry',
      'furious', 'disgusted', 'sick', 'tired', 'fed up'
    ]);

    this.angryWords = new Set([
      'angry', 'furious', 'rage', 'outrage', 'infuriated', 'livid', 'enraged',
      'mad', 'irate', 'hostile', 'aggressive', 'demanding', 'urgent', 'immediately',
      'now', 'asap', 'ridiculous', 'unacceptable', 'unbelievable', 'absolutely not'
    ]);

    this.frustratedWords = new Set([
      'frustrated', 'frustration', 'annoyed', 'irritated', 'bothered', 'upset',
      'exasperated', 'fed up', 'tired', 'sick of', 'over it', 'enough', 'again',
      'still', 'repeatedly', 'keep', 'keeps', 'always', 'never', 'impossible'
    ]);

    this.happyWords = new Set([
      'happy', 'happy', 'joy', 'joyful', 'excited', 'thrilled', 'delighted',
      'pleased', 'satisfied', 'content', 'cheerful', 'upbeat', 'positive',
      'wonderful', 'fantastic', 'great', 'amazing', 'love', 'can\'t wait',
      'looking forward', 'excellent', 'brilliant'
    ]);

    this.confusedWords = new Set([
      'confused', 'confusion', 'unclear', 'don\'t understand', 'not sure', 'confused about',
      'lost', 'uncertain', 'bewildered', 'puzzled', 'question', 'what', 'why',
      'how', 'explain', 'clarify', 'understand', 'help', 'not clear', 'complicated'
    ]);

    this.intensifiers = new Set([
      'very', 'extremely', 'absolutely', 'definitely', 'certainly', 'really',
      'quite', 'so', 'too', 'much', 'deeply', 'highly', 'incredibly', 'terribly',
      'awfully', 'strongly', 'particularly', 'especially'
    ]);

    this.negations = new Set([
      'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere', 'don\'t',
      'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'couldn\'t', 'shouldn\'t'
    ]);
  }

  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return this.getNeutralSentiment();
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    const emotionScores = {
      anger: this.calculateEmotionScore(words, this.angryWords),
      frustration: this.calculateEmotionScore(words, this.frustratedWords),
      happiness: this.calculateEmotionScore(words, this.happyWords),
      confusion: this.calculateEmotionScore(words, this.confusedWords)
    };

    const positiveScore = this.calculateScore(words, this.positiveWords);
    const negativeScore = this.calculateScore(words, this.negativeWords);

    const sentimentScore = positiveScore - negativeScore;
    const totalIntensity = positiveScore + negativeScore;

    return {
      primary: this.determinePrimarySentiment(sentimentScore, emotionScores, totalIntensity),
      confidence: Math.min(totalIntensity * 0.3 + 0.5, 0.99),
      score: sentimentScore,
      emotionScores: emotionScores,
      positiveScore: positiveScore,
      negativeScore: negativeScore,
      emotions: this.detectDominantEmotions(emotionScores),
      analysis: {
        keyPhrases: this.extractKeyPhrases(text),
        negativeIndicators: this.findIndicators(words, this.negativeWords),
        positiveIndicators: this.findIndicators(words, this.positiveWords),
        sentimentReason: this.generateSentimentReason(sentimentScore, emotionScores, text)
      }
    };
  }

  calculateScore(words, wordSet) {
    let score = 0;
    let found = false;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      
      if (wordSet.has(word)) {
        let intensity = 1;
        
        if (i > 0 && this.intensifiers.has(words[i - 1].replace(/[^a-zA-Z]/g, ''))) {
          intensity = 1.5;
        }
        
        if (i > 0 && this.negations.has(words[i - 1].replace(/[^a-zA-Z]/g, ''))) {
          intensity = -0.5;
        }
        
        score += intensity;
        found = true;
      }
    }
    
    return found ? score : 0;
  }

  calculateEmotionScore(words, emotionWords) {
    let score = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      
      if (emotionWords.has(word)) {
        let intensity = 1;
        
        if (i > 0 && this.intensifiers.has(words[i - 1].replace(/[^a-zA-Z]/g, ''))) {
          intensity = 1.5;
        }
        
        score += intensity;
      }
    }
    
    return Math.min(score / 2, 1);
  }

  determinePrimarySentiment(sentimentScore, emotionScores, totalIntensity) {
    if (emotionScores.anger > 0.6) return 'very_negative';
    if (emotionScores.frustration > 0.6) return 'negative';
    if (emotionScores.confusion > 0.5) return 'neutral';
    if (emotionScores.happiness > 0.6) return 'very_positive';
    
    if (sentimentScore > 2) return 'very_positive';
    if (sentimentScore > 0.5) return 'positive';
    if (sentimentScore < -2) return 'very_negative';
    if (sentimentScore < -0.5) return 'negative';
    
    return 'neutral';
  }

  detectDominantEmotions(emotionScores) {
    const emotions = [];
    
    const sorted = Object.entries(emotionScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    for (const [emotion, score] of sorted) {
      if (score > 0.3) {
        emotions.push({
          emotion: emotion,
          score: Math.round(score * 100)
        });
      }
    }

    return emotions.length > 0 ? emotions : [{ emotion: 'neutral', score: 50 }];
  }

  extractKeyPhrases(text) {
    const phrases = [];
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const matches = text.match(sentenceRegex) || [];

    for (const sentence of matches.slice(0, 3)) {
      const trimmed = sentence.trim();
      if (trimmed.length > 5) {
        phrases.push(trimmed);
      }
    }

    return phrases;
  }

  findIndicators(words, wordSet) {
    const indicators = [];
    
    for (const word of words) {
      const cleaned = word.replace(/[^a-zA-Z]/g, '');
      if (wordSet.has(cleaned)) {
        indicators.push(cleaned);
      }
    }

    return [...new Set(indicators)];
  }

  generateSentimentReason(sentimentScore, emotionScores, text) {
    if (emotionScores.anger > 0.6) {
      return 'Customer shows signs of anger - immediate attention recommended';
    }
    if (emotionScores.frustration > 0.5) {
      return 'Customer appears frustrated - consider escalation or immediate resolution';
    }
    if (emotionScores.confusion > 0.5) {
      return 'Customer seems confused - clarification or detailed explanation needed';
    }
    if (emotionScores.happiness > 0.6) {
      return 'Customer is satisfied and happy';
    }
    if (sentimentScore > 1) {
      return 'Overall positive sentiment detected';
    }
    if (sentimentScore < -1) {
      return 'Overall negative sentiment detected';
    }
    return 'Neutral sentiment - standard customer interaction';
  }

  getNeutralSentiment() {
    return {
      primary: 'neutral',
      confidence: 0.5,
      score: 0,
      emotionScores: {
        anger: 0,
        frustration: 0,
        happiness: 0,
        confusion: 0
      },
      emotions: [{ emotion: 'neutral', score: 50 }],
      analysis: {
        keyPhrases: [],
        negativeIndicators: [],
        positiveIndicators: [],
        sentimentReason: 'Insufficient data for sentiment analysis'
      }
    };
  }

  shouldEscalate(sentiment) {
    return sentiment.primary === 'very_negative' || 
           sentiment.emotionScores.anger > 0.7 ||
           sentiment.emotionScores.frustration > 0.8;
  }

  shouldShowProactive(sentiment) {
    return sentiment.primary === 'negative' ||
           sentiment.emotionScores.confusion > 0.5;
  }

  generateProactiveMessage(sentiment, userContext = {}) {
    if (sentiment.emotionScores.anger > 0.6) {
      return '🆘 I sense you\'re frustrated. I\'m here to help resolve this immediately. What can I do for you?';
    }
    if (sentiment.emotionScores.confusion > 0.5) {
      return '❓ Let me clarify that for you. What specifically would you like help with?';
    }
    if (sentiment.primary === 'negative') {
      return '😟 I\'m sorry to hear you\'re having issues. Let me help you get this resolved.';
    }
    if (sentiment.emotionScores.happiness > 0.5) {
      return '😊 Glad I could help! Is there anything else I can assist with?';
    }
    return null;
  }
}

export default SentimentAnalyzer;
