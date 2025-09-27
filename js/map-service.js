// js/map-service.js

let map;
let userMarker;

const initMap = (lat, lon, mapElement) => {
  if (map) return;
  map = L.map(mapElement).setView([lat, lon], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
  userMarker = L.marker([lat, lon]).addTo(map);
};

const getUserLocation = (mapElement, onSuccess, onError) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        initMap(latitude, longitude, mapElement);
        onSuccess({ latitude, longitude });
      },
      () => {
        initMap(42.2808, -83.743, mapElement); // Ann Arbor default
        onError("Location denied. Using default location.");
      }
    );
  } else {
    initMap(42.2808, -83.743, mapElement); // Ann Arbor default
    onError("Geolocation not supported.");
  }
};

const fetchBusinessAtLocation = async () => {
  if (!map) throw new Error("Map not initialized.");
  const { lat, lng } = map.getCenter();
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
  const data = await response.json();

  if (!data || !data.display_name) throw new Error("Could not identify location.");

  const placeName = data.address.amenity || data.address.shop || data.address.tourism || "Unknown Place";
  return placeName;
};

export { initMap, getUserLocation, fetchBusinessAtLocation };