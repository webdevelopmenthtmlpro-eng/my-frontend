class EntityExtractor {
  constructor() {
    this.emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    this.phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?(\d{1,4})\)?[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/g;
    this.dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}[,\s]+\d{4})/gi;
    this.cityCountryRegex = /(?:to|in|from|at|city|country)[\s:]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g;
    this.numberRegex = /(\b(?:package|packages|item|items|box|boxes|parcel|parcels)\s*:?\s*(\d+)|\d+\s*(?:package|packages|item|items|box|boxes|parcel|parcels)\b)/gi;
  }

  extractEmails(text) {
    const emails = [];
    let match;
    while ((match = this.emailRegex.exec(text)) !== null) {
      emails.push({
        value: match[0],
        type: 'email',
        position: match.index,
        confidence: 0.95
      });
    }
    this.emailRegex.lastIndex = 0;
    return emails;
  }

  extractPhoneNumbers(text) {
    const phones = [];
    let match;
    while ((match = this.phoneRegex.exec(text)) !== null) {
      const fullNumber = match[0];
      phones.push({
        value: fullNumber.replace(/[^\d+]/g, ''),
        original: fullNumber,
        type: 'phone',
        position: match.index,
        confidence: 0.85
      });
    }
    this.phoneRegex.lastIndex = 0;
    return phones;
  }

  extractDates(text) {
    const dates = [];
    let match;
    while ((match = this.dateRegex.exec(text)) !== null) {
      dates.push({
        value: match[0],
        type: 'date',
        position: match.index,
        confidence: 0.88,
        parsedDate: this.parseDate(match[0])
      });
    }
    this.dateRegex.lastIndex = 0;
    return dates;
  }

  parseDate(dateString) {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  extractNames(text) {
    const names = [];
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) || [];
    
    const commonWords = new Set(['Swift', 'Delivery', 'Package', 'Tracking', 'Order', 'Status', 'Please', 'Thank', 'Hi', 'Hello', 'SMS', 'Mr', 'Mrs', 'Ms', 'Dr', 'Prof']);
    
    for (const word of capitalizedWords) {
      if (!commonWords.has(word) && word.length > 2) {
        names.push({
          value: word,
          type: 'name',
          confidence: 0.72
        });
      }
    }
    
    return names;
  }

  extractDestinations(text) {
    const destinations = [];
    const lowerText = text.toLowerCase();
    
    const destinationKeywords = ['to ', 'in ', 'delivering to ', 'going to ', 'heading to ', 'destination ', 'address ', 'location '];
    
    for (const keyword of destinationKeywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = text.substring(index + keyword.length);
        const destination = afterKeyword.split(/[,.\n]/)[0].trim();
        
        if (destination.length > 2 && !this.isCommonWord(destination)) {
          destinations.push({
            value: destination,
            type: 'destination',
            keyword: keyword.trim(),
            confidence: 0.80
          });
        }
      }
    }
    
    return destinations;
  }

  extractPackageCount(text) {
    const counts = [];
    let match;
    const numberRegex = /(\d+)\s*(?:package|packages|item|items|box|boxes|parcel|parcels)/gi;
    
    while ((match = numberRegex.exec(text)) !== null) {
      counts.push({
        value: parseInt(match[1]),
        unit: match[2],
        type: 'package_count',
        original: match[0],
        confidence: 0.92
      });
    }
    
    const wordNumbers = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    
    for (const [word, num] of Object.entries(wordNumbers)) {
      const regex = new RegExp(`\\b${word}\\s+(?:package|packages|item|items|box|boxes|parcel|parcels)\\b`, 'gi');
      if (regex.test(text)) {
        counts.push({
          value: num,
          type: 'package_count',
          original: `${word} packages`,
          confidence: 0.85
        });
      }
    }
    
    return counts;
  }

  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'a', 'and', 'or', 'but', 'is', 'are', 'be', 'been',
      'that', 'this', 'from', 'to', 'of', 'in', 'for', 'with',
      'please', 'thank', 'hello', 'hi', 'yes', 'no', 'ok', 'okay',
      'package', 'tracking', 'order', 'delivery', 'swift'
    ]);
    
    return commonWords.has(word.toLowerCase());
  }

  extractAllEntities(text) {
    return {
      emails: this.extractEmails(text),
      phoneNumbers: this.extractPhoneNumbers(text),
      dates: this.extractDates(text),
      names: this.extractNames(text),
      destinations: this.extractDestinations(text),
      packageCounts: this.extractPackageCount(text),
      summary: {
        hasEmail: this.extractEmails(text).length > 0,
        hasPhone: this.extractPhoneNumbers(text).length > 0,
        hasDate: this.extractDates(text).length > 0,
        hasName: this.extractNames(text).length > 0,
        hasDestination: this.extractDestinations(text).length > 0,
        hasPackageInfo: this.extractPackageCount(text).length > 0
      }
    };
  }

  extractMostReliableEntities(text) {
    const allEntities = this.extractAllEntities(text);
    
    return {
      primaryEmail: allEntities.emails[0] || null,
      primaryPhone: allEntities.phoneNumbers[0] || null,
      nearestDate: allEntities.dates[0] || null,
      likelyName: allEntities.names[0] || null,
      primaryDestination: allEntities.destinations[0] || null,
      totalPackages: allEntities.packageCounts.reduce((sum, pkg) => sum + pkg.value, 0) || null,
      allEntities
    };
  }
}

export default EntityExtractor;
