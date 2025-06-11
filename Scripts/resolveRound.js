import { gameState } from './gameState.js';
import { calculatePoints } from './gameLogic.js';
import { showOutcome, showError } from './uiScript.js';
import { endRound } from './roundControl.js'; // If endRound is also in this file, remove this import

// This function handles the full round resolution, including winner, glow, and phase
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