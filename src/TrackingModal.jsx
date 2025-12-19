import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TrackingModal.css';
import LiveTrackingMap from './LiveTrackingMap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TrackingModal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#c53030', fontSize: '14px' }}>
            ⚠️ Error loading tracking map: {this.state.error?.message}
          </p>
          <p style={{ color: '#718096', fontSize: '12px' }}>
            Please close this dialog and try again
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const TrackingModal = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    } else {
      setMounted(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="tracking-modal-overlay" onClick={handleOverlayClick} style={{ display: 'flex' }}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <h2 className="tracking-modal-title">📍 Live Package Tracking</h2>
          <button 
            className="tracking-modal-close" 
            onClick={onClose} 
            title="Close (ESC)"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="tracking-modal-body">
          {mounted && (
            <ErrorBoundary>
              <LiveTrackingMap />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default TrackingModal;
