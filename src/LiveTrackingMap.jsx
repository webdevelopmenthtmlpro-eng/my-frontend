import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveTrackingMap.css';

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

const LiveTrackingMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(PACKAGE_STATUSES[0]);
  const [isPinMode, setIsPinMode] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [allMarkers, setAllMarkers] = useState([]);
  const [generatedTrackingId, setGeneratedTrackingId] = useState(null);
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get auth token
  const getToken = () => localStorage.getItem('token');

  // Initialize Leaflet Map
  useEffect(() => {
    try {
      if (!mapRef.current) {
        console.warn('Map ref not available');
        return;
      }

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

      osm.addTo(newMap);

      L.control.layers({ 'Street Map': osm, 'Satellite': satellite }).addTo(newMap);

      setMap(newMap);

      return () => {
        newMap.remove();
      };
    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
      setError('Failed to initialize map: ' + err.message);
    }
  }, []);

  // Add click listener to map when isPinMode changes
  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (isPinMode && selectedUser) {
        handleMapClick(e);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, isPinMode, selectedUser, selectedStatus]);

  // Fetch verified users
  useEffect(() => {
    fetchVerifiedUsers();
    fetchTrackingRecords();
  }, []);

  // Display existing tracking records on map
  useEffect(() => {
    if (!map || !trackingRecords.length) return;

    // Clear existing markers
    allMarkers.forEach(marker => map.removeLayer(marker));

    const newMarkers = trackingRecords.map(record => {
      const icon = getMarkerIcon(record.status);
      const marker = L.marker([record.location.lat, record.location.lng], { icon })
        .addTo(map);

      const popupContent = `
        <div style="font-size: 13px;">
          <strong style="color: #4f46e5;">${record.user.fullName}</strong><br/>
          <div style="margin-top: 6px;">
            <strong>📧 Email:</strong> ${record.user.email}<br/>
            <strong>📦 Status:</strong> <span style="color: ${getStatusColor(record.status)}; font-weight: 600;">${record.status}</span><br/>
            <strong>🆔 Tracking:</strong> <span style="font-family: monospace; color: #4f46e5;">${record.trackingId}</span><br/>
            <strong>🕐 Updated:</strong> ${new Date(record.updatedAt).toLocaleString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      return marker;
    });

    setAllMarkers(newMarkers);
  }, [map, trackingRecords]);

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

  const fetchVerifiedUsers = async () => {
    try {
      setError(null);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/verified-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verified users');
      }
      
      const data = await response.json();
      setVerifiedUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching verified users:', err);
      setError('Failed to load verified users. Make sure you are logged in as admin.');
    }
  };

  const fetchTrackingRecords = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('No token available for fetching tracking records');
        setTrackingRecords([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracking records (${response.status})`);
      }
      
      const data = await response.json();
      setTrackingRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tracking records:', err);
      setTrackingRecords([]);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setGeneratedTrackingId(null);
    setSuccessMessage(null);
    setError(null);
  };

  const handleMapClick = useCallback(async (e) => {
    try {
      console.log('Map clicked. isPinMode:', isPinMode, 'selectedUser:', selectedUser ? selectedUser.name : null);
      
      if (!isPinMode || !selectedUser || !map) {
        console.log('Skipping click - isPinMode:', isPinMode, 'selectedUser:', !!selectedUser, 'map:', !!map);
        return;
      }

      const location = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      
      console.log('Creating marker at:', location);

      // Remove previous temporary marker
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      // Create a temporary marker
      const icon = getMarkerIcon(selectedStatus);
      const marker = L.marker([location.lat, location.lng], { icon }).addTo(map);

      const popupContent = `
        <div style="font-size: 13px;">
          <strong style="color: #4f46e5;">${selectedUser.name}</strong><br/>
          <strong>📧 Email:</strong> ${selectedUser.email}<br/>
          <strong>📦 Status:</strong> <span style="color: ${getStatusColor(selectedStatus)}; font-weight: 600;">${selectedStatus}</span><br/>
          <strong>📍 Location:</strong> ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
      setCurrentMarker(marker);
      
      console.log('Saving tracking record...');
      // Save the tracking record
      await saveTrackingRecord(location);
      setIsPinMode(false);
    } catch (err) {
      console.error('Error in handleMapClick:', err);
      setError('Failed to process map click. Please try again.');
      setIsPinMode(false);
    }
  }, [isPinMode, selectedUser, map, selectedStatus, currentMarker]);

  const saveTrackingRecord = async (location) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      if (!selectedUser || !selectedUser._id) {
        throw new Error('No user selected. Please select a verified user.');
      }

      console.log('Sending tracking request:', { userId: selectedUser._id, status: selectedStatus, location });

      const response = await fetch(`${API_BASE_URL}/api/admin/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          status: selectedStatus,
          location
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to save tracking record (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonErr) {
          const textError = await response.text();
          console.error('Error response text:', textError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.trackingId) {
        throw new Error('No tracking ID returned from server');
      }

      console.log('Tracking ID generated:', data.trackingId);
      setGeneratedTrackingId(data.trackingId);
      setSuccessMessage('✅ Tracking record created successfully!');
      setError(null);
      
      // Refresh tracking records
      await fetchTrackingRecords();
    } catch (err) {
      const errorMsg = err.message || 'Failed to save tracking record';
      console.error('Error saving tracking record:', err);
      setError(errorMsg);
      setGeneratedTrackingId(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePinModeToggle = () => {
    if (!selectedUser) {
      setError('Please select a verified user first.');
      return;
    }
    setIsPinMode(!isPinMode);
    setError(null);
  };

  const copyTrackingId = async () => {
    if (generatedTrackingId) {
      try {
        await navigator.clipboard.writeText(generatedTrackingId);
        setSuccessMessage('Tracking ID copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedTrackingId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setSuccessMessage('Tracking ID copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  return (
    <section className="live-tracking-section">
      <h2 className="section-title">📍 Live Package Tracking Map</h2>
      
      {error && <div className="error-message">⚠️ {error}</div>}
      {successMessage && <div className="success-message">✅ {successMessage}</div>}
      
      <div className="tracking-layout">
        {/* Sidebar - Verified Users */}
        <div className="tracking-sidebar">
          <h3 className="sidebar-title">👥 Verified Users ({verifiedUsers.length})</h3>
          <p className="sidebar-hint">Select a user to assign package tracking</p>
          <div className="users-list">
            {verifiedUsers.length === 0 ? (
              <div className="no-users">
                <span className="no-users-icon">📭</span>
                <p>No verified users available</p>
                <small>Verify users in the Users tab first</small>
              </div>
            ) : (
              verifiedUsers.map((user) => (
                <button
                  key={user._id}
                  className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                  title={`${user.name} - ${user.email}`}
                >
                  <div className="user-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                  {selectedUser?._id === user._id && (
                    <span className="selected-badge">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="tracking-map-wrapper">
          <div ref={mapRef} className="tracking-map" id="adminMap">
            {!map && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading map...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="tracking-controls">
            <div className="selected-user-display">
              {selectedUser ? (
                <div className="selected-user-info">
                  <span className="label">Selected:</span>
                  <span className="user-name">{selectedUser.name}</span>
                </div>
              ) : (
                <span className="no-selection">No user selected</span>
              )}
            </div>

            <div className="status-control">
              <label htmlFor="statusSelect">📦 Package Status:</label>
              <select
                id="statusSelect"
                className="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={!selectedUser}
              >
                {PACKAGE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={`pin-button ${isPinMode ? 'active' : ''}`}
              onClick={handlePinModeToggle}
              disabled={!selectedUser || loading}
            >
              {loading ? (
                <>⏳ Saving...</>
              ) : isPinMode ? (
                <>📍 Click on Map to Pin Location</>
              ) : (
                <>📌 Pin Package Location</>
              )}
            </button>
          </div>

          {/* Tracking ID Display */}
          <div className="tracking-id-box">
            <div className="id-header">
              <div className="id-label">🆔 Generated Tracking ID</div>
              {trackingRecords.length > 0 && (
                <span className="records-count">{trackingRecords.length} active packages</span>
              )}
            </div>
            {generatedTrackingId ? (
              <div className="id-display">
                <span className="tracking-id">{generatedTrackingId}</span>
                <button
                  className="copy-button"
                  onClick={copyTrackingId}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
            ) : (
              <div className="id-placeholder">
                <span className="placeholder-icon">📦</span>
                <span>Select a user, set status, and click on the map to generate a tracking ID</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="instructions-box">
            <h4>📋 How to Create a Tracking Record:</h4>
            <ol>
              <li>Select a verified user from the left sidebar</li>
              <li>Choose the package status from the dropdown</li>
              <li>Click "Pin Package Location" button</li>
              <li>Click on the map to pin the exact package location</li>
              <li>Copy the generated tracking ID and share with the customer</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTrackingMap;
