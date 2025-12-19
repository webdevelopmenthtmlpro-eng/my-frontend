// src/CourierDashboard.jsx
import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px"
};

const defaultCenter = {
  lat: 6.5244, // Lagos default
  lng: 3.3792
};

function CourierDashboard({ idToken }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCPCAkpYgOMTapv5Y6v5bWVJ6pbSMTtL74" // 🔑 Replace this
  });

  const [location, setLocation] = useState(defaultCenter);
  const [status, setStatus] = useState("");

  const handleMapClick = async (e) => {
    const newLoc = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setLocation(newLoc);

    try {
      const res = await fetch("http://localhost:5000/api/courier/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(newLoc)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Location updated successfully");
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error updating location:", err);
      setStatus("❌ Server error updating location");
    }
  };

  return isLoaded ? (
    <div>
      <h2>Courier Dashboard</h2>
      <p>Click on the map to update package location.</p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location}
        zoom={14}
        onClick={handleMapClick}
      >
        <Marker position={location} />
      </GoogleMap>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
  ) : (
    <p>Loading map...</p>
  );
}

export default CourierDashboard;
