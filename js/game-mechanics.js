// js/game-logic.js

/* TODO: Consider removing this
const BUSINESS_TO_CATEGORY_MAP = {
  starbucks: "dining",
  "mcdonald's": "dining",
  "whole foods": "groceries",
  kroger: "groceries",
  "trader joe's": "groceries",
  meijer: "groceries",
  shell: "gas",
  exxon: "gas",
  marriott: "travel",
  "amc theatres": "entertainment",
};
*/

const determineBestCard = (placeCategory, userCards, allCards) => {
  // Find the best card in the user's wallet for that category
  let bestCardInfo = { name: "No suitable card", reward: 0 };
  let maxReward = -1;

  userCards.forEach((id) => {
    const card = allCards[id];
    const reward = card.rewards[placeCategory] || card.rewards.default;
    if (reward > maxReward) {
      maxReward = reward;
      bestCardInfo = { name: card.name, reward };
    }
  });

  return bestCardInfo;
};

export { determineBestCard };