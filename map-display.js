let map;
let userMarker;

const initMap = (lat, lon) => {
  if (map) {
    map.setView([lat, lon], 16);
    userMarker.setLatLng([lat, lon]);
    return;
  }

  // Create a map instance and link it to our 'map' div.
  map = L.map("map").setView([lat, lon], 16);

  // Add the visual map tiles. These are the images that make up the map.
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
  }).addTo(map);

  userMarker = L.marker([lat, lon])
    // Add the marker to the map.
    .addTo(map)
    // Add a popup message when clicked.
    .bindPopup("You are here!");
};

navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // The coordinates are passed here to create the map.
  initMap(latitude, longitude);
});
