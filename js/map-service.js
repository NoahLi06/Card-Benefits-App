// js/map-service.js

let map;
let userMarker;

// From your teammate: More robust map initialization
const initMap = (lat, lon, mapElement) => {
  if (map) { // If map already exists, just move the view
    map.setView([lat, lon], 16);
    userMarker.setLatLng([lat, lon]);
    return;
  }
  
  map = L.map(mapElement).setView([lat, lon], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 16,
    // necessary for copyright :P
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  userMarker = L.marker([lat, lon]).addTo(map).bindPopup("You are here!");
  map.invalidateSize();
};

// From your teammate: Cleaner location logic with callbacks
export const getUserLocation = (mapElement, onSuccess, onError) => {
  const fallbackLat = 42.2808;
  const fallbackLon = -83.743;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        initMap(pos.coords.latitude, pos.coords.longitude, mapElement);
        if (onSuccess) onSuccess(); // Call success callback if provided
      },
      () => {
        initMap(fallbackLat, fallbackLon, mapElement);
        if (onError) onError("Location denied. Using default location.");
      }
    );
  } else {
    initMap(fallbackLat, fallbackLon, mapElement);
    if (onError) onError("Geolocation not supported.");
  }
};

// From our previous version: The logic to find the business
export const fetchBusinessAtLocation = async () => {
  if (!map) throw new Error("Map not initialized.");
  
  const { lat, lng } = map.getCenter();
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
  if (!response.ok) throw new Error("Failed to contact location server.");
  const data = await response.json();

  if (!data || !data.display_name) throw new Error("Could not identify location.");

  const placeName = data.address.amenity || data.address.shop || data.address.tourism || "Unknown Place";
  return placeName;
};