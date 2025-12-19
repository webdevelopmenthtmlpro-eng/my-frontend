import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CustomerTracking.css';

const PACKAGE_STATUSES = [
  'Pending Pickup',
  'Pickup Assigned',
  'Pickup Accepted',
  'Enroute to Facility',
  'Arrived at Hub or Facility',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Awaiting Receipt',
  'Delivery Failed',
  'Returned to Sender'
];

const API_BASE_URL = 'http://localhost:5000';

const CustomerTracking = ({ idToken }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [marker, setMarker] = useState(null);
  const [animatedMarker, setAnimatedMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const animationIntervalRef = useRef(null);

  // Trigger pop-out animation and backdrop blur when tracking data loads
  useEffect(() => {
    const pageBody = document.body;
    
    if (trackingData && containerRef.current) {
      containerRef.current.classList.remove('container-initial');
      containerRef.current.classList.remove('container-animate-pop');
      void containerRef.current.offsetHeight;
      containerRef.current.classList.add('container-animate-pop');
      pageBody.classList.add('tracking-page-blurred');
      console.log('✨ Pop-out animation triggered!');
    } else {
      containerRef.current?.classList.remove('container-animate-pop');
      containerRef.current?.classList.add('container-initial');
      pageBody.classList.remove('tracking-page-blurred');
    }
  }, [trackingData]);

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  // Initialize Leaflet Map only when logged in
  useEffect(() => {
    try {
      if (!mapRef.current || !isUserLoggedIn()) return;
      
      const newMap = L.map(mapRef.current).setView([6.5244, 3.3792], 11);
      
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        name: 'Street Map'
      });

      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 18,
        name: 'Satellite'
      });

      satellite.addTo(newMap);
      L.control.layers({ 'Street Map': osm, 'Satellite': satellite }).addTo(newMap);

      setMap(newMap);

      return () => {
        newMap.remove();
      };
    } catch (err) {
      setError('Failed to initialize map');
    }
  }, []);

  const getMarkerIcon = (status) => {
    const colorMap = {
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
    const color = colorMap[status] || '#9ca3af';
    
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">📦</div>`,
      iconSize: [36, 36],
      className: 'custom-icon'
    });
  };

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

  const createCourierIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #ff6b6b;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 3px #ff6b6b, 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        animation: pulse 1.5s infinite;
      ">🚚</div>`,
      iconSize: [32, 32],
      className: 'animated-courier-icon'
    });
  };

  const animateCourierMovement = (location) => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    if (animatedMarker && map && map.hasLayer(animatedMarker)) {
      map.removeLayer(animatedMarker);
    }

    const centerLat = location.lat;
    const centerLng = location.lng;
    const radius = 0.005; // ~500m at this zoom level
    let angle = 0;

    const courier = L.marker([centerLat, centerLng], { 
      icon: createCourierIcon(),
      zIndexOffset: 1000
    }).addTo(map);

    const popupContent = `
      <div style="font-size: 12px; text-align: center;">
        <strong>🚚 Courier En Route</strong><br/>
        <span style="color: #ff6b6b;">Moving to delivery location</span>
      </div>
    `;
    
    courier.bindPopup(popupContent);

    setAnimatedMarker(courier);

    animationIntervalRef.current = setInterval(() => {
      angle = (angle + 2) % 360;
      const rad = (angle * Math.PI) / 180;
      const newLat = centerLat + radius * Math.cos(rad);
      const newLng = centerLng + radius * Math.sin(rad);
      
      courier.setLatLng([newLat, newLng]);
    }, 100);
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending Pickup': '📦',
      'Pickup Assigned': '👤',
      'Pickup Accepted': '✅',
      'Enroute to Facility': '🚚',
      'Arrived at Hub or Facility': '🏢',
      'In Transit': '🛣️',
      'Out for Delivery': '🚗',
      'Delivered': '📍',
      'Awaiting Receipt': '⏳',
      'Delivery Failed': '❌',
      'Returned to Sender': '↩️'
    };
    return icons[status] || '📦';
  };

  const handleSearchTracking = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/${searchInput.trim()}`, {
        headers: {
          'Authorization': idToken ? `Bearer ${idToken}` : undefined
        }
      });

      if (!response.ok) {
        throw new Error('Tracking ID not found');
      }

      const data = await response.json();
      setTrackingData(data);
      setTrackingId(searchInput.trim());
      setSearchInput('');
      setSuccessMessage('Tracking information loaded!');

      // Update map with new location - use setTimeout to ensure map is ready
      if (data.location) {
        setTimeout(() => {
          if (!map || !map._container) {
            console.error('Map not ready');
            return;
          }

          const newLocation = [data.location.lat, data.location.lng];

          // Remove existing marker
          if (marker && map.hasLayer(marker)) {
            map.removeLayer(marker);
          }

          // Create new marker
          const icon = getMarkerIcon(data.status);
          const newMarker = L.marker(newLocation, { icon }).addTo(map);

          const popupContent = `
            <div style="font-size: 13px;">
              <strong style="color: #4f46e5;">📦 ${data.user.fullName}</strong><br/>
              <div style="margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
                <strong>📧 Email:</strong> ${data.user.email}<br/>
                <strong>🆔 Tracking:</strong> <span style="font-family: monospace; color: #4f46e5;">${data.trackingId}</span><br/>
                <strong>📍 Status:</strong> <span style="color: ${getStatusColor(data.status)}; font-weight: 600;">${data.status}</span><br/>
                <strong>📍 Coordinates:</strong> ${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}<br/>
                <strong>🕐 Updated:</strong> ${new Date(data.updatedAt).toLocaleString()}
              </div>
            </div>
          `;

          newMarker.bindPopup(popupContent).openPopup();
          setMarker(newMarker);
          map.setView(newLocation, 14);

          // Animate courier movement for active statuses
          const activeStatuses = ['Out for Delivery', 'In Transit', 'Enroute to Facility'];
          if (activeStatuses.includes(data.status)) {
            setTimeout(() => {
              animateCourierMovement({ lat: data.location.lat, lng: data.location.lng });
            }, 500);
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching tracking:', err);
      setError(err.message || 'Failed to retrieve tracking information');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setTrackingId('');
    setTrackingData(null);
    setSearchInput('');
    setError(null);
    setSuccessMessage(null);
    
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    
    if (marker && map && map.hasLayer(marker)) {
      map.removeLayer(marker);
      setMarker(null);
    }
    
    if (animatedMarker && map && map.hasLayer(animatedMarker)) {
      map.removeLayer(animatedMarker);
      setAnimatedMarker(null);
    }
  };

  const containerStyle = {
    ...styles.container,
    opacity: trackingData ? 1 : 0,
    transform: trackingData ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(80px)',
    filter: trackingData ? 'blur(0px)' : 'blur(20px)',
    transition: trackingData ? 'none' : 'none',
    animation: trackingData ? 'containerPopOut 1.2s cubic-bezier(0.12, 0.65, 0.25, 1.08) forwards' : 'none',
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={styles.headerSection}>
        <h2 style={styles.title}>📍 Track Your Package</h2>
        <p style={styles.subtitle}>Enter your tracking ID to see your package location and delivery status</p>
      </div>

      {error && <div style={styles.errorMessage}>⚠️ {error}</div>}
      {successMessage && <div style={styles.successMessage}>✅ {successMessage}</div>}

      <div style={styles.searchSection}>
        <form onSubmit={handleSearchTracking} style={styles.searchForm}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Enter tracking ID (e.g., SWIFT-1234567890-ABCDE)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              style={styles.searchButton}
              disabled={loading || !searchInput.trim()}
            >
              {loading ? '🔍 Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>
      </div>

      <div style={styles.contentWrapper}>
        {/* Map */}
        <div style={styles.mapSection}>
          <div ref={mapRef} style={{
            ...styles.map,
            backgroundColor: isUserLoggedIn() ? '#e0e7ff' : '#000000'
          }}>
            {!map && isUserLoggedIn() && (
              <div style={styles.mapLoading}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#fff' }}>Loading map...</p>
              </div>
            )}
            {!isUserLoggedIn() && (
              <div style={styles.mapPlaceholder}>
                <p>📦 Please log in to track your packages</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Info */}
        {trackingData && (
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📦 Package Details</h3>
                <button onClick={handleClearSearch} style={styles.clearButton}>
                  ✕
                </button>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Recipient:</span>
                  <span style={styles.detailValue}>{trackingData.user.fullName}</span>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Email:</span>
                  <span style={styles.detailValue}>{trackingData.user.email}</span>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Tracking ID:</span>
                  <span style={{ ...styles.detailValue, fontFamily: 'monospace', color: '#4f46e5' }}>
                    {trackingData.trackingId}
                  </span>
                </div>

                <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                  <span style={styles.detailLabel}>Current Status:</span>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(trackingData.status),
                    color: '#fff'
                  }}>
                    {getStatusIcon(trackingData.status)} {trackingData.status}
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Latitude:</span>
                  <span style={styles.detailValue}>{trackingData.location.lat.toFixed(6)}</span>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Longitude:</span>
                  <span style={styles.detailValue}>{trackingData.location.lng.toFixed(6)}</span>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Last Updated:</span>
                  <span style={styles.detailValue}>
                    {new Date(trackingData.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Created:</span>
                  <span style={styles.detailValue}>
                    {new Date(trackingData.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={styles.statusTimeline}>
                <h4 style={styles.timelineTitle}>📋 Status Timeline</h4>
                <div style={styles.timelineItem}>
                  <div style={{
                    ...styles.timelineIndicator,
                    backgroundColor: getStatusColor(trackingData.status)
                  }}></div>
                  <div>
                    <strong>{trackingData.status}</strong>
                    <p style={styles.timelineTime}>
                      {new Date(trackingData.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!trackingData && (
          <div style={styles.placeholderSection}>
            <div style={styles.placeholderContent}>
              <div style={styles.placeholderIcon}>📦</div>
              <h3 style={styles.placeholderTitle}>No Package Information</h3>
              <p style={styles.placeholderText}>
                Enter your tracking ID above to see your package location and delivery status in real-time
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    willChange: 'transform, opacity, filter',
  },
  headerSection: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0',
  },
  errorMessage: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    borderLeft: '4px solid #c53030',
    fontSize: '14px',
  },
  successMessage: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    borderLeft: '4px solid #22c55e',
    fontSize: '14px',
  },
  searchSection: {
    marginBottom: '24px',
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
  },
  inputWrapper: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  input: {
    flex: '1',
    padding: '12px 16px',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
  },
  mapSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  map: {
    width: '100%',
    height: '500px',
    backgroundColor: '#e0e7ff',
    position: 'relative',
  },
  mapLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#718096',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 12px',
  },
  mapPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#999',
    fontSize: '16px',
    fontWeight: '500',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0',
  },
  cardTitle: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
  },
  clearButton: {
    background: '#f56565',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#2d3748',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    width: 'fit-content',
  },
  statusTimeline: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
    marginTop: '16px',
  },
  timelineTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginTop: '4px',
    flexShrink: '0',
  },
  timelineTime: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#a0aec0',
  },
  placeholderSection: {
    gridColumn: '1 / -1',
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '60px 24px',
    textAlign: 'center',
    border: '2px dashed #cbd5e0',
  },
  placeholderContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  placeholderIcon: {
    fontSize: '48px',
    opacity: '0.5',
  },
  placeholderTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#4a5568',
  },
  placeholderText: {
    margin: '0',
    fontSize: '14px',
    color: '#718096',
  },
};

export default CustomerTracking;
