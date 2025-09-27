// Handles map + location
let map;
let userMarker;

export const initMap = (lat, lon, mapElement, onError) => {
  if (typeof L === "undefined") {
    onError("Map library failed to load. Please check your connection.");
    return null;
  }

  if (!map) {
    map = L.map(mapElement).setView([lat, lon], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup("You are here!");
  }
  return map;
};

export const getUserLocation = (
  mapElement,
  onError,
  fallbackLat = 42.2808,
  fallbackLon = -83.743
) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        initMap(pos.coords.latitude, pos.coords.longitude, mapElement, onError);
      },
      () => {
        onError("Location denied. Using fallback location.");
        initMap(fallbackLat, fallbackLon, mapElement, onError);
      }
    );
  } else {
    onError("Geolocation not supported. Using fallback.");
    initMap(fallbackLat, fallbackLon, mapElement, onError);
  }
};

export const getMapInstance = () => map;
