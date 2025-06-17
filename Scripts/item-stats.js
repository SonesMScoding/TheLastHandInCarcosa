import { checkAndUnlockItems } from './items.js';

export function updateItemStats(gameState) {
  // Ensure counters exist
  if (typeof gameState.totalPlayerWins !== 'number') gameState.totalPlayerWins = 0;
  if (typeof gameState.totalPlayerLosses !== 'number') gameState.totalPlayerLosses = 0;
  if (typeof gameState.totalBankerWins !== 'number') gameState.totalBankerWins = 0;
  if (typeof gameState.playerLostMoney !== 'number') gameState.playerLostMoney = 0;

  // Update cumulative counters
  if (gameState.lastWinner === "player") {
    gameState.totalPlayerWins++;
  } else if (gameState.lastWinner === "banker") {
    gameState.totalPlayerLosses++;
    gameState.totalBankerWins++;
  }

  // Track lost money for Repaired Reputation
  if (typeof gameState.lastLossAmount === 'number' && gameState.lastLossAmount > 0) {
    gameState.playerLostMoney += gameState.lastLossAmount;
    gameState.lastLossAmount = 0;
  }

  // Unlock items if their conditions are met
  checkAndUnlockItems(gameState);
}