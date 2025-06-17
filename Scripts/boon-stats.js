// boon-stats.js
//Tracks and updates boon-related stats after each round

import { calculatePoints } from './game-logic.js';
import { gameState } from './game-state.js';

// Update all boon-related stats (win streak, suit counts, won by one point)
export function updateBoonStats(gameState) {
  // --- Win Streak ---
  if (gameState.lastWinner === "player") {
    gameState.playerWinStreak = (gameState.playerWinStreak || 0) + 1;
  } else {
    gameState.playerWinStreak = 0;
  }

  // --- Won by One Point ---
  if (
    gameState.betAmounts &&
    gameState.betAmounts[gameState.lastWinner] > 0
  ) {
    const playerPoints = calculatePoints(gameState.playerHand);
    const bankerPoints = calculatePoints(gameState.bankerHand);
    if (
      (gameState.lastWinner === "player" && playerPoints === bankerPoints + 1) ||
      (gameState.lastWinner === "banker" && bankerPoints === playerPoints + 1)
    ) {
      gameState.wonByOne = true;
    } else {
      gameState.wonByOne = false;
    }
  } else {
    gameState.wonByOne = false;
  }

  // --- Suit Counts (Diamonds, Spades, Clubs) ---
  gameState.playerDiamondsHeld += gameState.playerHand.filter(card => card.suit === "dia" || card.suit === "diamonds").length;
  gameState.playerSpadesHeld += gameState.playerHand.filter(card => card.suit === "spades").length;
  gameState.playerClubsHeld += gameState.playerHand.filter(card => card.suit === "club" || card.suit === "clubs").length;
}