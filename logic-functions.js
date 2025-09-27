const BUSINESS_TO_CATEGORY_MAP = {
  starbucks: "dining",
  "mcdonald's": "dining",
  "whole foods": "groceries",
  kroger: "groceries",
  shell: "gas",
  marriott: "travel",
  kroger: "groceries",
  "trader joe's": "groceries",
  "hy-vee": "groceries",
  meijer: "groceries",
  hollister: "clothing",
  nike: "clothing",
  adidas: "clothing",
  outlet: "clothing",
};

const findBestCard = async () => {
  const { lat, lng } = map.getCenter();

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  const data = await response.json();

  const placeName =
    data.address.amenity || data.address.shop || "an unknown place";

  let category = "default";
  const placeNameLower = placeName.toLowerCase();

  for (const [key, value] of Object.entries(BUSINESS_TO_CATEGORY_MAP)) {
    if (placeNameLower.includes(key)) {
      category = value;
      // Stop once a match is found.
      break;
    }
  }
};

// --- Part 2: Wallet Management ---

// explains how the user's credit cards are added, removed, and saved.

// A. STATE & STORAGE:
// The user's cards are stored in an array of unique IDs.
let userCards = [];

// B. SAVING TO LOCAL STORAGE:
// `localStorage` is a browser feature that stores simple data, so it persists
// even after the browser tab is closed. We must convert the array to a JSON string to store it.
const saveCards = () => {
  localStorage.setItem("userCreditCards", JSON.stringify(userCards));
};

// C. LOADING FROM LOCAL STORAGE:
// When the app starts, it checks if any cards were previously saved.
// If not, it provides a default set of cards for the demo.
const loadCards = () => {
  const savedCards = localStorage.getItem("userCreditCards");
  if (savedCards) {
    // If data exists, parse the JSON string back into an array.
    userCards = JSON.parse(savedCards);
  } else {
    // For new users, provide a default wallet.
    userCards = ["chase-sapphire-preferred", "amex-blue-cash-everyday"];
    saveCards(); // And save it for next time.
  }
};

// D. THE USER INTERFACE (Modal & Event Listeners)
// The HTML includes a hidden modal for managing cards. JavaScript controls it.

// When a user clicks "Add Card":
addCardBtn.addEventListener("click", () => {
  const selectedCardId = addCardSelect.value;
  if (selectedCardId && !userCards.includes(selectedCardId)) {
    userCards.push(selectedCardId); // Add the card ID to our array
    saveCards(); // Save the updated array to localStorage
    renderWalletCards(); // Re-draw the card list on the main screen
    renderModal(); // Re-draw the modal to update its contents
  }
});

// When a user clicks the 'x' (remove) button on a card:
modalCardList.addEventListener("click", (e) => {
  // Check if the clicked element is a remove button
  if (e.target.classList.contains("remove-card-btn")) {
    const cardIdToRemove = e.target.dataset.cardId;
    // The .filter() method creates a new array excluding the card to be removed.
    userCards = userCards.filter((id) => id !== cardIdToRemove);
    saveCards();
    renderWalletCards();
    renderModal();
  }
});
