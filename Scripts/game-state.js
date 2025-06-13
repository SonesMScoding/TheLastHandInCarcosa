/* ==========================================
  game-state.js
  Central game state management for Baccarat
   [Add your informational notes here.]
   ========================================== */

export const gameState = {
  funds: 100,
  currentBet: 0,
  selectedZone: null,
  betAmounts: {
    player: 0,
    tie: 0,
    banker: 0
  },
  shoe: [],
  discard: [],
  gamePhase: 'betting', // can be 'betting', 'dealing', 'resolving'
  deck: [],
  playerHand: [],
  bankerHand: [],
  totalPayouts: 0,
  totalLosses: 0,
  reshuffles: 0,         // Number of times deck has been reshuffled
  maxReshuffles: 4,      // Maximum allowed reshuffles
  gameOver: false        // Track if game is over
};