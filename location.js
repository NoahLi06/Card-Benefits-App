const getUserLocation = () => {
  // checks if the browser supports the Geolocation API.
  if (navigator.geolocation) {
    // request the user's current position.
    navigator.geolocation.getCurrentPosition(
      //  runs if the user approves.
      (position) => {
        const { latitude, longitude } = position.coords;
        // The app then uses these coordinates to initialize the map.
        initMap(latitude, longitude);
      },
      // this function runs if the user denies permission or an error occurs.
      () => {
        showError(
          "Location access denied. Please enable it in your browser settings."
        );
        // Aloads a default location in Ann Arbor
        initMap(42.2808, -83.743);
      }
    );
  } else {
    // 5. This runs if the browser doesn't support geolocation at all.
    showError("Location is not supported by this browser.");
  }
};
