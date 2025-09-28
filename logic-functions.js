// js/main.js

import * as Wallet from './js/wallet-services.js';
import * as Map from './js/map-service.js';
import * as Game from './js/game-mechanics.js';

// --- DOM ELEMENTS ---
const mapElement = document.getElementById("map");
const locationInfoArea = document.getElementById("location-info-area");
const locationNameEl = document.getElementById("location-name");
const captureDealBtn = document.getElementById("capture-deal-btn");
const errorMessageEl = document.getElementById("error-message");
const walletCardsEl = document.getElementById("wallet-cards");
const manageWalletBtn = document.getElementById("manage-wallet-btn");
const walletModal = document.getElementById("wallet-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const addCardSelect = document.getElementById("add-card-select");
const addCardBtn = document.getElementById("add-card-btn");
const modalCardList = document.getElementById("modal-card-list");

// --- UI RENDERING FUNCTIONS ---
const showError = (message) => {
  errorMessageEl.textContent = message;
  errorMessageEl.classList.remove("hidden");
};
const clearError = () => errorMessageEl.classList.add("hidden");

const renderWalletCards = () => {
  walletCardsEl.innerHTML = "";
  const cards = Wallet.getUserCards();
  if (cards.length === 0) {
    walletCardsEl.innerHTML = '<p class="text-center">Your wallet is empty.</p>';
    return;
  }
  cards.forEach((id) => {
    const card = Wallet.ALL_CARDS_DATABASE[id];
    if (card) {
      const div = document.createElement("div");
      div.className = "pixel-border p-2 text-center text-sm";
      div.textContent = card.name;
      walletCardsEl.appendChild(div);
    }
  });
};

const renderModal = () => {
  const userCards = Wallet.getUserCards();
  const allCards = Wallet.ALL_CARDS_DATABASE;
  
  addCardSelect.innerHTML = "";
  Object.entries(allCards).forEach(([id, card]) => {
    if (!userCards.includes(id)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = card.name;
      addCardSelect.appendChild(option);
    }
  });

  modalCardList.innerHTML = "";
  userCards.forEach((id) => {
    const card = allCards[id];
    const div = document.createElement("div");
    div.className = "flex justify-between items-center pixel-border p-2";
    div.innerHTML = `
      <span>${card.name}</span>
      <button data-card-id="${id}" class="remove-card-btn bg-red-500 text-white text-xs font-bold w-6 h-6 hover:bg-red-600">&times;</button>
    `;
    modalCardList.appendChild(div);
  });
};

// --- MAIN ACTION ---
const handleCaptureDeal = async () => {
    clearError();
    captureDealBtn.disabled = true;
    captureDealBtn.textContent = "Analyzing...";

    try {
        const {name: placeName, category: placeCategory} = await Map.fetchBusinessAtLocation();
        locationNameEl.textContent = placeName;
        locationInfoArea.classList.remove('hidden');

        // Now we can implement the "Bonus Roll" logic here!
        // For now, let's just show the best card.
        const bestCard = Game.determineBestCard(placeCategory, Wallet.getUserCards(), Wallet.ALL_CARDS_DATABASE);

        let categoryPretty = placeCategory.charAt(0).toUpperCase() + placeCategory.slice(1);
        // This is where you would show the result to the user, perhaps in another modal.
        alert(`You're at ${placeName} (${categoryPretty}).\nBest Cardball: ${bestCard.name} for ${bestCard.reward}% back!`);

    } catch (error) {
        showError(error.message);
    } finally {
        captureDealBtn.disabled = false;
        captureDealBtn.textContent = "Capture Deal";
    }
};


// --- INITIALIZATION & EVENT LISTENERS ---
// --- INITIALIZATION & EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Load wallet first
  Wallet.loadCards();
  renderWalletCards();
  
  // Use the new, cleaner map and location functions
  Map.getUserLocation(
    mapElement,
    () => { // onSuccess
      clearError();
      // Optional: Automatically fetch business name on load
      // handleCaptureDeal(); 
    },
    (errorMsg) => showError(errorMsg) // onError
  );

  captureDealBtn.addEventListener("click", handleCaptureDeal);

  manageWalletBtn.addEventListener("click", () => {
    renderModal();
    walletModal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => walletModal.classList.add("hidden"));
  
  addCardBtn.addEventListener("click", () => {
    Wallet.addUserCard(addCardSelect.value);
    renderWalletCards();
    renderModal();
  });

  modalCardList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-card-btn")) {
      Wallet.removeUserCard(e.target.dataset.cardId);
      renderWalletCards();
      renderModal();
    }
  });
});