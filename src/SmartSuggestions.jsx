import React, { useState, useEffect } from 'react';

const SmartSuggestions = ({ onSuggestionClick, autoplay = false }) => {
  const [animatingIndex, setAnimatingIndex] = useState(null);
  
  const suggestions = [
    {
      id: 'switch_day_mode',
      label: '☀️ Switch to Day Mode',
      text: 'switch to day mode'
    },
    {
      id: 'switch_night_mode',
      label: '🌙 Switch to Night Mode',
      text: 'switch to night mode'
    },
    {
      id: 'spanish_language',
      label: '🇪🇸 Cambiar a Español',
      text: 'change language to spanish'
    },
    {
      id: 'track_item',
      label: '📦 Help me track this item',
      text: 'help me track my package'
    },
    {
      id: 'check_status',
      label: '📍 Check delivery status',
      text: 'what is the status of my delivery'
    },
    {
      id: 'human_agent',
      label: '👤 Speak with an agent',
      text: 'I want to speak with an agent'
    },
  ];

  // Auto-play animation sequence
  useEffect(() => {
    if (!autoplay) return;

    const timeouts = [];
    const animationDuration = 800; // ms per suggestion
    const displayDuration = 1200; // ms to show each suggestion
    const totalCycles = 3; // cycle through all suggestions 3 times

    for (let cycle = 0; cycle < totalCycles; cycle++) {
      suggestions.forEach((_, index) => {
        const delay = (cycle * suggestions.length * (displayDuration + 100)) + (index * (displayDuration + 100));
        
        // Show suggestion (animate in)
        timeouts.push(
          setTimeout(() => setAnimatingIndex(index), delay)
        );
        
        // Hide suggestion (animate out)
        timeouts.push(
          setTimeout(() => setAnimatingIndex(null), delay + displayDuration)
        );
      });
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [autoplay, suggestions.length]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
      }}
    >
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        💡 Quick Suggestions
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
        }}
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#fff',
              background: 'linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: animatingIndex === index ? 'scale(1.05)' : 'scale(1)',
              opacity: animatingIndex === index ? 1 : 0.7,
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.target.style.transform = 'translateY(-1px) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              const isAnimating = animatingIndex === index;
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.target.style.transform = isAnimating ? 'scale(1.05)' : 'scale(1)';
            }}
            title={suggestion.text}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
      <p
        style={{
          margin: '8px 0 0 0',
          fontSize: '11px',
          color: '#999',
          fontStyle: 'italic',
        }}
      >
        Click a suggestion to add it to your message
      </p>
    </div>
  );
};

export default SmartSuggestions;
