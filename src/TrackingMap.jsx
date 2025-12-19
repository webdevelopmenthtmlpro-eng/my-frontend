// src/TrackingMap.jsx
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px"
};

function TrackingMap({ idToken, packageId }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCPCAkpYgOMTapv5Y6v5bWVJ6pbSMTtL74" // 🔑 Replace this
  });

  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/client/package-location/${packageId}`,
          {
            headers: { Authorization: `Bearer ${idToken}` }
          }
        );
        const data = await res.json();
        setLocation(data.location);
      } catch (err) {
        console.error("Error fetching package location:", err);
      }
    };
    fetchLocation();
  }, [idToken, packageId]);

  return isLoaded && location ? (
    <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={14}>
      <Marker position={location} />
    </GoogleMap>
  ) : (
    <p>Loading package location...</p>
  );
}

export default TrackingMap;
