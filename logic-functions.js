document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const mapElement = document.getElementById("map");
  const findCardBtn = document.getElementById("find-card-btn");
  const recommendationArea = document.getElementById("recommendation-area");
  const locationNameEl = document.getElementById("location-name");
  const cardRecommendationEl = document.getElementById("card-recommendation");
  const errorMessageEl = document.getElementById("error-message");
  const walletCardsEl = document.getElementById("wallet-cards");
  const manageWalletBtn = document.getElementById("manage-wallet-btn");
  const walletModal = document.getElementById("wallet-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const addCardSelect = document.getElementById("add-card-select");
  const addCardBtn = document.getElementById("add-card-btn");
  const modalCardList = document.getElementById("modal-card-list");

  // --- STATE & DATA ---
  let map;
  let userMarker;
  let userCards = [];

  // Pre-defined database of available credit cards and their reward structures.
  const ALL_CARDS_DATABASE = {
    "chase-sapphire-preferred": {
      name: "Chase Sapphire Preferred",
      rewards: { dining: 3, travel: 2, default: 1 },
    },
    "amex-blue-cash-everyday": {
      name: "Amex Blue Cash Everyday",
      rewards: { groceries: 3, gas: 3, "online retail": 3, default: 1 },
    },
    "citi-custom-cash": {
      name: "Citi Custom Cash",
      rewards: { dining: 5, groceries: 5, gas: 5, travel: 5, default: 1 }, // Note: simplified rule
    },
    "capital-one-savorone": {
      name: "Capital One SavorOne",
      rewards: {
        dining: 3,
        entertainment: 3,
        streaming: 3,
        groceries: 3,
        default: 1,
      },
    },
    "discover-it-cash-back": {
      name: "Discover it Cash Back",
      rewards: { groceries: 5, dining: 5, default: 1 }, // Note: simplified rotating categories
    },
  };

  // SIMULATION: A simple map of business names to categories.
  // A real app would use a Merchant Category Code (MCC) API.
  const BUSINESS_TO_CATEGORY_MAP = {
    starbucks: "dining",
    "mcdonald's": "dining",
    "whole foods": "groceries",
    kroger: "groceries",
    "trader joe's": "groceries",
    shell: "gas",
    exxon: "gas",
    marriott: "travel",
    "amc theatres": "entertainment",
    "amazon.com": "online retail",
    netflix: "streaming",
    "hy-vee": "groceries",
    meijer: "groceries",
  };

  // --- FUNCTIONS ---

  // Initialize the Leaflet map
  const initMap = (lat, lon) => {
    if (map) return; // Don't re-initialize
    map = L.map(mapElement).setView([lat, lon], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup("You are here!");
  };

  // Show a generic error message
  const showError = (message) => {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.remove("hidden");
    recommendationArea.classList.add("hidden");
  };

  // Hide error messages
  const clearError = () => {
    errorMessageEl.classList.add("hidden");
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          initMap(latitude, longitude);
        },
        () => {
          showError(
            "Location access denied. Please enable it in your browser settings."
          );
          // Default to a sample location if denied
          initMap(42.2808, -83.743); // Ann Arbor, MI
        }
      );
    } else {
      showError("Geolocation is not supported by this browser.");
      initMap(42.2808, -83.743); // Ann Arbor, MI
    }
  };

  // Save user's cards to localStorage
  const saveCards = () => {
    localStorage.setItem("userCreditCards", JSON.stringify(userCards));
  };

  // Load user's cards from localStorage
  const loadCards = () => {
    const savedCards = localStorage.getItem("userCreditCards");
    if (savedCards) {
      userCards = JSON.parse(savedCards);
    } else {
      // Default cards for new users
      userCards = ["chase-sapphire-preferred", "amex-blue-cash-everyday"];
      saveCards();
    }
  };

  // Render the cards in the main wallet view
  const renderWalletCards = () => {
    walletCardsEl.innerHTML = "";
    if (userCards.length === 0) {
      walletCardsEl.innerHTML =
        '<p class="text-center text-gray-500">Your wallet is empty.</p>';
      return;
    }
    userCards.forEach((cardId) => {
      const card = ALL_CARDS_DATABASE[cardId];
      if (card) {
        const cardEl = document.createElement("div");
        cardEl.className = "bg-gray-100 p-2 rounded-lg text-center";
        cardEl.textContent = card.name;
        walletCardsEl.appendChild(cardEl);
      }
    });
  };

  // Render cards and controls in the management modal
  const renderModal = () => {
    // Populate dropdown
    addCardSelect.innerHTML = "";
    Object.entries(ALL_CARDS_DATABASE).forEach(([id, card]) => {
      // Only show cards that are not already in the user's wallet
      if (!userCards.includes(id)) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = card.name;
        addCardSelect.appendChild(option);
      }
    });

    // Populate list of cards to remove
    modalCardList.innerHTML = "";
    userCards.forEach((cardId) => {
      const card = ALL_CARDS_DATABASE[cardId];
      const cardEl = document.createElement("div");
      cardEl.className =
        "flex justify-between items-center bg-gray-100 p-2 rounded-lg";
      cardEl.innerHTML = `
                <span>${card.name}</span>
                <button data-card-id="${cardId}" class="remove-card-btn bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-red-600">&times;</button>
            `;
      modalCardList.appendChild(cardEl);
    });
  };

  // The main logic for finding the best card
  const findBestCard = async () => {
    clearError();
    if (!map) {
      showError("Map is not initialized yet.");
      return;
    }

    if (userCards.length === 0) {
      showError("You have no cards in your wallet. Please add one first.");
      return;
    }

    findCardBtn.disabled = true;
    findCardBtn.textContent = "Analyzing...";

    const { lat, lng } = map.getCenter();

    // Use Nominatim Reverse Geocoding API (free, no key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (!data || !data.display_name) {
      showError("Could not identify your location.");
      findCardBtn.disabled = false;
      findCardBtn.textContent = "Analyze My Location";
      return;
    }

    const placeName =
      data.address.amenity ||
      data.address.shop ||
      data.address.tourism ||
      "an unknown place";
    const placeNameLower = placeName.toLowerCase();

    // Find category from our simulated map
    let category = "default";
    for (const [key, value] of Object.entries(BUSINESS_TO_CATEGORY_MAP)) {
      if (placeNameLower.includes(key)) {
        category = value;
        break;
      }
    }

    // Find the best card
    let bestCard = null;
    let maxReward = -1;

    userCards.forEach((cardId) => {
      const card = ALL_CARDS_DATABASE[cardId];
      const reward = card.rewards[category] || card.rewards.default;
      if (reward > maxReward) {
        maxReward = reward;
        bestCard = card.name;
      }
    });

    // Display result
    locationNameEl.textContent = placeName;
    cardRecommendationEl.textContent = `${bestCard} for ${maxReward}% back!`;
    recommendationArea.classList.remove("hidden");

    findCardBtn.disabled = false;
    findCardBtn.textContent = "Analyze My Location";
  };

  // --- EVENT LISTENERS ---
  findCardBtn.addEventListener("click", findBestCard);

  manageWalletBtn.addEventListener("click", () => {
    renderModal();
    walletModal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    walletModal.classList.add("hidden");
  });

  addCardBtn.addEventListener("click", () => {
    const selectedCardId = addCardSelect.value;
    if (selectedCardId && !userCards.includes(selectedCardId)) {
      userCards.push(selectedCardId);
      saveCards();
      renderWalletCards();
      renderModal(); // Re-render modal to update dropdown and list
    }
  });

  modalCardList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-card-btn")) {
      const cardIdToRemove = e.target.dataset.cardId;
      userCards = userCards.filter((id) => id !== cardIdToRemove);
      saveCards();
      renderWalletCards();
      renderModal();
    }
  });

  // --- INITIALIZATION CALLS ---
  loadCards();
  renderWalletCards();
  getUserLocation();
});
