import { gameState } from './gameState.js';
import { calculatePoints } from './gameLogic.js';
import { showOutcome, showError } from './uiScript.js';
import { addLedgerRow } from './uiScript.js';


// This function should handle payouts, losses, and show outcome.
// You may want to expand this logic for your specific game rules.
export function endRound(winner) {
  let payout = 0;
  let loss = 0;
  let msg = "";

  // Example: payout logic for bets
  if (gameState.betAmounts && gameState.betAmounts.player > 0) {
    if (winner === "player") {
      payout += gameState.betAmounts.player * 2;
      msg += "Player bet wins!<br>";
    } else {
      loss += gameState.betAmounts.player;
      msg += "Player bet loses.<br>";
    }
  }
  if (gameState.betAmounts && gameState.betAmounts.banker > 0) {
    if (winner === "banker") {
      // Typical baccarat banker payout is 0.95:1 due to commission
      payout += Math.floor(gameState.betAmounts.banker * 1.95);
      msg += "Banker bet wins!<br>";
    } else {
      loss += gameState.betAmounts.banker;
      msg += "Banker bet loses.<br>";
    }
  }
  if (gameState.betAmounts && gameState.betAmounts.tie > 0) {
    if (winner === "tie") {
      payout += gameState.betAmounts.tie * 8;
      msg += "Tie bet wins!<br>";
    } else {
      loss += gameState.betAmounts.tie;
      msg += "Tie bet loses.<br>";
    }
  }

  // Update funds
  gameState.funds += payout - loss;

  // Show outcome message
  showOutcome(msg, payout, loss);

  // Optionally: reset bets, update HUD, etc.
  if (gameState.betAmounts) {
    gameState.betAmounts.player = 0;
    gameState.betAmounts.banker = 0;
    gameState.betAmounts.tie = 0;
  }
  addLedgerRow(winner);
}

export function resolveRound() {
  // Only allow if phase is 'dealing'
  if (gameState.gamePhase !== "dealing") {
    showError("You must deal cards before ending the round!");
    return;
  }

  const playerPoints = calculatePoints(gameState.playerHand);
  const bankerPoints = calculatePoints(gameState.bankerHand);

  let winner = "";
  if (playerPoints > bankerPoints) winner = "player";
  else if (bankerPoints > playerPoints) winner = "banker";
  else winner = "tie";

  // Remove any existing glow first
  document.querySelectorAll('.bet-zone').forEach(zone => zone.classList.remove('bet-glow'));

  // Add glow to the winning zone
  let glowZone = null;
  if (winner === "player") {
    glowZone = document.querySelector('.player-bet');
  } else if (winner === "banker") {
    glowZone = document.querySelector('.banker-bet');
  } else if (winner === "tie") {
    glowZone = document.querySelector('.tie-bet');
  }
  if (glowZone) glowZone.classList.add('bet-glow');

  endRound(winner);

  // Remove glow when the user clicks anywhere (like outcome message)
  const removeGlow = () => {
    document.querySelectorAll('.bet-zone').forEach(zone => zone.classList.remove('bet-glow'));
    document.removeEventListener('click', removeGlow);
  };
  // Delay to avoid immediate removal from the button click itself
  setTimeout(() => {
    document.addEventListener('click', removeGlow);
  }, 100);

  // Set phase to 'resolving' so End Round can't be pressed again until next deal
  gameState.gamePhase = "resolving";
}

