// js/game-logic.js

const BUSINESS_TO_CATEGORY_MAP = {
  starbucks: "dining", "mcdonald's": "dining",
  "whole foods": "groceries", kroger: "groceries", "trader joe's": "groceries", meijer: "groceries",
  shell: "gas", exxon: "gas",
  marriott: "travel",
  "amc theatres": "entertainment",
};

const determineBestCard = (placeName, userCards, allCards) => {
  const lowerPlaceName = placeName.toLowerCase();
  
  // Find the category for the business
  let category = "default";
  for (const [key, value] of Object.entries(BUSINESS_TO_CATEGORY_MAP)) {
    if (lowerPlaceName.includes(key)) {
      category = value;
      break;
    }
  }

  // Find the best card in the user's wallet for that category
  let bestCardInfo = { name: "No suitable card", reward: 0 };
  let maxReward = -1;

  userCards.forEach((id) => {
    const card = allCards[id];
    const reward = card.rewards[category] || card.rewards.default;
    if (reward > maxReward) {
      maxReward = reward;
      bestCardInfo = { name: card.name, reward };
    }
  });

  return { businessCategory: category, bestCard: bestCardInfo };
};

export { determineBestCard };