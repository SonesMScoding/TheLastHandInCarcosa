/* ==========================================
  game-state.js
  Central game state management for Baccarat
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
  deck: [],
  discard: [],
  gamePhase: 'betting', // can be 'betting', 'dealing', 'resolving'
  playerHand: [],
  bankerHand: [],
  totalPayouts: 0,
  totalLosses: 0,
  reshuffles: 0,         // Number of times deck has been reshuffled
  maxReshuffles: 4,      // Maximum allowed reshuffles
  lastWinner: null,      // Last winner of the round (player, banker, tie)
  gameOver: false,       // Track if game is over

  // --- Boon system additions ---
  boonUnlocks: {},       // { boonKey: true, ... }
  activeBoons: [],       // [boonKey, boonKey, ...] (max 3)

  // Cumulative stats for boon unlocks
  playerDiamondsHeld: 0, // Total diamonds held by player (for Cthulhu's Boon)
  playerSpadesHeld: 0,   // Total spades held by player (for Nya's Boon)
  playerClubsHeld: 0,    // Total clubs held by player (for Shub's Boon)
  playerWinStreak: 0,    // Current win streak (for Yellow King)
  hasWonByOnePoint: false, // Set true if player/banker wins by 1 point (for Sigil of Greed)
  // hasLostOnTie: false      // Set true if player loses on a tie (for Mask of Doubles)

  // --- Per-round boon effect fields ---
  diamondReduction: 0,      // Diamonds in banker's hand (Cthulhu's Boon)
  adjustedBankerPoints: 0,  // Adjusted banker points after boon
  nyaBonusApplied: false,   // Nya's Boon bonus applied this round
  ykBonusApplied: false,    // Yellow King bonus applied this round
  shubBonusApplied: false,  // Shub's Boon multiplier applied this round
  sigilBonusApplied: false, // Sigil of Greed bonus applied this round

  // --- Item system additions ---
  itemUnlocks: {},      // which items are unlocked
  usedItems: [],        // which items have been used
  activeItem: null,     // the currently active item (by key), or null if none
};

// this keeps EVERYTHING tracked