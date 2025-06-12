import { gameState } from './gameState.js';
import { calculatePoints } from './gameLogic.js'; 
import { showOutcome, addLedgerRow } from './uiScript.js';
import { setClearBtnState } from './bettingChips.js'; 
import { showReshufflePopup, shuffleDeck } from './deck.js';

// --- Utility: End Game ---
function endGame(message) {
  gameState.gameOver = true;
  setTimeout(() => {
    alert(message);
    window.location.reload();
  }, 500);
}

// --- Utility: Dissolve Chips and Cards, Reset Phase ---
function dissolveChipsAndCards() {
  document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.classList.add('dissolve'));
  document.querySelectorAll('.player-hand .card, .banker-hand .card').forEach(card => card.classList.add('dissolve'));

  setTimeout(() => {
    document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.remove());
    document.querySelectorAll('.player-hand .card, .banker-hand .card').forEach(card => card.remove());
    gameState.gamePhase = "betting";
    setClearBtnState(); 
  }, 1300);
}

// --- Utility: Update HUDs ---
function updateRoundHUD({ payout, loss }) {
  // Main HUD
  const funds = document.getElementById("funds");
  const activeBet = document.getElementById("active-bet");
  const payouts = document.getElementById("payouts");
  const losses = document.getElementById("losses");

  if (funds) funds.textContent = gameState.funds;
  if (activeBet) activeBet.textContent = 0;
  if (payouts) payouts.textContent = gameState.totalPayouts;
  if (losses) losses.textContent = gameState.totalLosses;

  // Alt HUD
  const fundsAlt = document.getElementById("funds-alt");
  const activeBetAlt = document.getElementById("active-bet-alt");
  const payoutsAlt = document.getElementById("payouts-alt");
  const lossesAlt = document.getElementById("losses-alt");

  if (fundsAlt) fundsAlt.textContent = gameState.funds;
  if (activeBetAlt) activeBetAlt.textContent = 0;
  if (payoutsAlt) payoutsAlt.textContent = gameState.totalPayouts;
  if (lossesAlt) lossesAlt.textContent = gameState.totalLosses;
}

// --- Main: End Round, Handle Payouts, Losses, Reshuffles, Game End ---
export function endRound(winner) {
  let payout = 0;
  let loss = 0;
  let msg = "";

  // --- Calculate Payouts/Losses ---
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
      payout += Math.floor(gameState.betAmounts.banker * 1.95); // 0.95:1 payout
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

  // --- Update Funds and Totals ---
  gameState.funds += payout - loss;
  gameState.currentBet = 0;
  gameState.totalPayouts += payout;
  gameState.totalLosses += loss;

  // --- Show Outcome and Animate Table ---
  showOutcome(msg, payout, loss, dissolveChipsAndCards);

  // --- Check for Game End ---
  if (gameState.funds <= 0) {
    endGame("Game over! You ran out of funds.");
    return;
  }
  if (gameState.reshuffles >= gameState.maxReshuffles && gameState.deck.length <= 6) {
    if (gameState.funds > 100) {
      endGame("Congratulations! You win!");
    } else {
      endGame("Game over! You did not reach your goal.");
    }
    return;
  }

  // --- Reshuffle if Needed ---
  if (gameState.deck.length <= 6 && gameState.reshuffles < gameState.maxReshuffles) {
    showReshufflePopup(() => {
      shuffleDeck();
    });
  }

  // --- Reset Bets for Next Round ---
  if (gameState.betAmounts) {
    gameState.betAmounts.player = 0;
    gameState.betAmounts.banker = 0;
    gameState.betAmounts.tie = 0;
  }
  gameState.selectedZone = null;

  // --- Update UI ---
  addLedgerRow(winner);
  updateRoundHUD({ payout, loss });
}

// --- Main: Resolve Round (Determine Winner, Glow, Call endRound) ---
export function resolveRound() {
  // Only allow if phase is 'dealing'
  if (gameState.gamePhase !== "dealing") {
    alert("You must deal cards before ending the round!");
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
  setTimeout(() => {
    document.addEventListener('click', removeGlow);
  }, 300);

  // Set phase to 'resolving' so End Round can't be pressed again until next deal
  gameState.gamePhase = "resolving";
}