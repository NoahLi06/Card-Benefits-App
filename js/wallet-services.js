// js/wallet-service.js

// All available cards live here
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
  "discover-it-cashback": {
    name: "Discover It Cashback",
    rewards: { rotating: 5, default: 1 },
  },
  "bank-of-america-cash-rewards": {
    name: "Bank of America Cash Rewards",
    rewards: { gas: 3, dining: 2, travel: 2, default: 1 },
  },
  "wells-fargo-active-cash": {
    name: "Wells Fargo Active Cash",
    rewards: { default: 2 },
  },
  "chase-freedom-unlimited": {
    name: "Chase Freedom Unlimited",
    rewards: { dining: 3, travel: 3, drugstores: 3, default: 1.5 },
  },
  "amex-gold-card": {
    name: "Amex Gold Card",
    rewards: { dining: 4, groceries: 4, travel: 3, default: 1 },
  },
  "citi-double-cash": { name: "Citi Double Cash", rewards: { default: 2 } },
  "capital-one-venture": {
    name: "Capital One Venture",
    rewards: { travel: 2, default: 1 },
  },
  "discover-it-student": {
    name: "Discover It Student",
    rewards: { rotating: 5, default: 1 },
  },
  "bank-of-america-travel-rewards": {
    name: "Bank of America Travel Rewards",
    rewards: { default: 1.5 },
  },
  "wells-fargo-visa-signature": {
    name: "Wells Fargo Visa Signature",
    rewards: { default: 1.5 },
  },
  "apple-card": { name: "Apple Card", rewards: { default: 1 } },
};

let userCards = []; // This is the user's current wallet

const saveCards = () =>
  localStorage.setItem("userCreditCards", JSON.stringify(userCards));

const loadCards = () => {
  const saved = localStorage.getItem("userCreditCards");
  if (saved) {
    userCards = JSON.parse(saved);
  } else {
    // Give the user some default cards to start
    userCards = ["chase-freedom-unlimited", "amex-blue-cash-everyday"];
    saveCards();
  }
};

const addUserCard = (id) => {
  if (id && !userCards.includes(id)) {
    userCards.push(id);
    saveCards();
  }
};

const removeUserCard = (id) => {
  userCards = userCards.filter((cardId) => cardId !== id);
  saveCards();
};

const getUserCards = () => userCards;

export {
  loadCards,
  addUserCard,
  removeUserCard,
  getUserCards,
  ALL_CARDS_DATABASE,
};
