import { initMap, getUserLocation, getMapInstance } from "./geolocator.js";

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

  // --- STATE ---
  let userCards = [];

  // Card database
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
      rewards: { dining: 5, groceries: 5, gas: 5, travel: 5, default: 1 },
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
      rewards: { groceries: 5, dining: 5, default: 1 },
    },
    "chase-freedom-unlimited": {
      name: "Chase Freedom Unlimited",
      rewards: { groceries: 1.5, dining: 3, default: 1.5 },
    },
  };

  // Simulation of MCC categories
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

  // --- HELPERS ---
  const showError = (msg) => {
    errorMessageEl.textContent = msg;
    errorMessageEl.classList.remove("hidden");
    recommendationArea.classList.add("hidden");
  };
  const clearError = () => errorMessageEl.classList.add("hidden");

  const saveCards = () =>
    localStorage.setItem("userCreditCards", JSON.stringify(userCards));
  const loadCards = () => {
    const saved = localStorage.getItem("userCreditCards");
    userCards = saved
      ? JSON.parse(saved)
      : ["chase-sapphire-preferred", "amex-blue-cash-everyday"];
    saveCards();
  };

  const renderWalletCards = () => {
    walletCardsEl.innerHTML = "";
    if (userCards.length === 0) {
      walletCardsEl.innerHTML = `<p class="text-center text-gray-500">Your wallet is empty.</p>`;
      return;
    }
    userCards.forEach((id) => {
      const card = ALL_CARDS_DATABASE[id];
      if (card) {
        const div = document.createElement("div");
        div.className = "bg-gray-100 p-2 rounded-lg text-center";
        div.textContent = card.name;
        walletCardsEl.appendChild(div);
      }
    });
  };

  const renderModal = () => {
    addCardSelect.innerHTML = "";
    Object.entries(ALL_CARDS_DATABASE).forEach(([id, card]) => {
      if (!userCards.includes(id)) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = card.name;
        addCardSelect.appendChild(option);
      }
    });

    modalCardList.innerHTML = "";
    userCards.forEach((id) => {
      const card = ALL_CARDS_DATABASE[id];
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center bg-gray-100 p-2 rounded-lg";
      div.innerHTML = `
        <span>${card.name}</span>
        <button data-card-id="${id}" class="remove-card-btn bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-red-600">&times;</button>
      `;
      modalCardList.appendChild(div);
    });
  };

  const findBestCard = async () => {
    clearError();
    const map = getMapInstance();
    if (!map) {
      showError("Map not ready yet.");
      return;
    }
    if (userCards.length === 0) {
      showError("Add a card to your wallet first.");
      return;
    }

    findCardBtn.disabled = true;
    findCardBtn.textContent = "Analyzing...";

    const { lat, lng } = map.getCenter();
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await res.json();

    const placeName =
      data?.address?.amenity ||
      data?.address?.shop ||
      data?.address?.tourism ||
      "a place";
    let category = "default";
    for (const [key, value] of Object.entries(BUSINESS_TO_CATEGORY_MAP)) {
      if (placeName.toLowerCase().includes(key)) {
        category = value;
        break;
      }
    }

    let bestCard = null;
    let maxReward = -1;
    userCards.forEach((id) => {
      const card = ALL_CARDS_DATABASE[id];
      const reward = card.rewards[category] || card.rewards.default;
      if (reward > maxReward) {
        maxReward = reward;
        bestCard = card.name;
      }
    });

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
  closeModalBtn.addEventListener("click", () =>
    walletModal.classList.add("hidden")
  );
  addCardBtn.addEventListener("click", () => {
    const id = addCardSelect.value;
    if (id && !userCards.includes(id)) {
      userCards.push(id);
      saveCards();
      renderWalletCards();
      renderModal();
    }
  });
  modalCardList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-card-btn")) {
      const id = e.target.dataset.cardId;
      userCards = userCards.filter((c) => c !== id);
      saveCards();
      renderWalletCards();
      renderModal();
    }
  });

  // --- INIT ---
  loadCards();
  renderWalletCards();
  getUserLocation(mapElement, showError);
});
