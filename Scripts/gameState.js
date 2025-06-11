// Use a shared gameState object for all stateful values
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
  bankerHand: []
};