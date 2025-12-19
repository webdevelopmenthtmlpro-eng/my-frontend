import React, { useEffect } from 'react';
import './TrackingModal.css';

const TestModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="tracking-modal-overlay" onClick={handleOverlayClick}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <h2 className="tracking-modal-title">✅ Test Modal</h2>
          <button 
            className="tracking-modal-close" 
            onClick={onClose} 
            title="Close (ESC)"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="tracking-modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '16px', color: '#2d3748' }}>
            ✅ Modal is working!
          </p>
          <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
            The modal overlay and popup infrastructure is functioning correctly.
          </p>
          <p style={{ fontSize: '13px', color: '#a0aec0', marginBottom: '20px' }}>
            If you can see this message, the modal system itself is working.
          </p>
          <div style={{
            backgroundColor: '#f0f4ff',
            border: '1px solid #c7d2fe',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', fontSize: '12px', color: '#4f46e5', fontFamily: 'monospace' }}>
              If the main tracking map disappears when you try to open it,<br />
              the issue is likely with the Google Maps API configuration.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close Test Modal
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestModal;
