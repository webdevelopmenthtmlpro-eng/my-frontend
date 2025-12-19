import React, { useState, useRef, useEffect } from 'react';
import './TrackPackage.css';

const TrackPackage = () => {
  const mapRef = useRef(null);
  const sectionRef = useRef(null);
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize Google Map when modal opens
  useEffect(() => {
    if (!isModalOpen || !mapRef.current) return;

    const loadGoogleMaps = async () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: 'satellite',
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      });
      setMap(newMap);
    };

    loadGoogleMaps();
  }, [isModalOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch(`/api/tracking/${encodeURIComponent(trackingId.trim())}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tracking ID not found. Please check and try again.');
        }
        throw new Error('Failed to fetch tracking information');
      }

      const data = await response.json();
      setTrackingData(data);
      
      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.classList.remove('animate-pop');
          void sectionRef.current.offsetWidth;
          sectionRef.current.classList.add('animate-pop');
          console.log('Animation triggered on section');
        }
      }, 100);
      
      setTimeout(() => {
        setIsModalOpen(true);
      }, 200);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrackingData(null);
    setTrackingId('');
    setError(null);
    if (marker) {
      marker.setMap(null);
    }
  };

  // Update map when tracking data is available and modal is open
  useEffect(() => {
    if (!isModalOpen || !trackingData || !map) return;

    if (trackingData.location) {
      const position = { lat: trackingData.location.lat, lng: trackingData.location.lng };
      map.setCenter(position);
      map.setZoom(13);

      if (marker) {
        marker.setMap(null);
      }

      const newMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: trackingData.status,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #000; font-size: 14px;">
            <strong>${trackingData.user.fullName}</strong><br/>
            <strong>Status:</strong> ${trackingData.status}<br/>
            <strong>Last Updated:</strong> ${new Date(trackingData.updatedAt).toLocaleString()}
          </div>
        `
      });

      newMarker.addListener('click', () => {
        infoWindow.open(map, newMarker);
      });

      setMarker(newMarker);
    }
  }, [isModalOpen, trackingData, map]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending Pickup': '#f59e0b',
      'Pickup Assigned': '#3b82f6',
      'Pickup Accepted': '#10b981',
      'Enroute to Facility': '#8b5cf6',
      'Arrived at Hub or Facility': '#6366f1',
      'In Transit': '#06b6d4',
      'Out for Delivery': '#f97316',
      'Delivered': '#22c55e',
      'Awaiting Receipt': '#14b8a6',
      'Delivery Failed': '#ef4444',
      'Returned to Sender': '#64748b'
    };
    return statusColors[status] || '#9ca3af';
  };

  return (
    <div className="track-package-container">
      <section className="track-package-section" ref={sectionRef}>
        <div className="tracking-content">
          {/* Header */}
          <div className="tracking-header">
            <div className="header-icon">📦</div>
            <div>
              <h1 className="tracking-title">Track Your Package</h1>
              <p className="tracking-subtitle">Enter your tracking ID to locate your delivery</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="tracking-form">
            <div className="form-group">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Enter tracking ID (e.g., SWIFT-1234567890)"
                className="tracking-input"
                disabled={loading}
                autoFocus
              />
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? 'Searching...' : '🔍 Track Package'}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {!trackingData && !error && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-text">Enter a tracking ID above to view your package status and location</p>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && trackingData && (
        <div className="tracking-modal-overlay" onClick={closeModal}>
          <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-modal-header">
              <h2 className="tracking-modal-title">📦 Package Details</h2>
              <button className="tracking-modal-close" onClick={closeModal} title="Close (ESC)">
                ✕
              </button>
            </div>
            <div className="tracking-modal-body">
              {/* Status Card */}
              <div className="modal-status-card">
                <div
                  className="modal-status-badge"
                  style={{ backgroundColor: getStatusColor(trackingData.status) }}
                >
                  {trackingData.status}
                </div>
                <div className="modal-package-info">
                  <div className="modal-info-item">
                    <span className="modal-info-label">📮 Recipient</span>
                    <span className="modal-info-value">{trackingData.user.fullName}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">📧 Email</span>
                    <span className="modal-info-value">{trackingData.user.email}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">🆔 Tracking ID</span>
                    <span className="modal-info-value tracking-id">{trackingData.trackingId}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">🕐 Last Updated</span>
                    <span className="modal-info-value">{new Date(trackingData.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="modal-map-container">
                <h3 className="modal-map-title">📍 Package Location</h3>
                <div ref={mapRef} className="tracking-map"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPackage;