let map;
let marker;

function initMap() {
  map = L.map('map').setView([6.5244, 3.3792], 13); // Default center (Lagos)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

async function trackPackage() {
  const trackingId = document.getElementById('trackingId').value;

  try {
    const res = await fetch(`http://localhost:5000/api/package/${trackingId}`);
    const data = await res.json();

    if (!data || !data.lat || !data.lng) {
      alert("Package not found or location not updated yet.");
      return;
    }

    // Remove old marker if exists
    if (marker) {
      map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker([data.lat, data.lng]).addTo(map)
      .bindPopup(`Status: ${data.status}<br>Updated: ${data.updated_at}`)
      .openPopup();

    // Center map on package
    map.setView([data.lat, data.lng], 15);

  } catch (err) {
    console.error("Error fetching package:", err);
    alert("Could not fetch package location.");
  }
}

initMap();
