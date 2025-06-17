/* ==========================================
   round-control.js
   Ends the game round, handles payouts, losses,
   implements reshuffles, and final game end.
   ========================================== */

// ========== Imports ==========
import { gameState } from './game-state.js';
import { calculatePoints } from './game-logic.js';
import { showOutcome, addLedgerRow, showWinOverlay, showLoseOverlay, showError, renderBoonbox, FullRenderItems } from './ui-utils.js';
import { setClearBtnState } from './betting-chips.js';
import { showReshufflePopup, shuffleDeck } from './deck.js';
import { checkAndUnlockBoons } from './boons.js';
import { updateBoonStats } from './boon-stats.js';
import { updateItemStats } from './item-stats.js';
import { checkAndUnlockItems } from './items.js';

// ========== Helpers ==========
// https://www.geeksforgeeks.org/check-a-number-is-prime-or-not-using-javascript/

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function endGame(message) {
  gameState.gameOver = true;
  setTimeout(() => {
    if (message.includes("win")) {
      showWinOverlay();
    } else {
      showLoseOverlay();
    }
  }, 500);
}

function dissolveChipsAndCards() {
  document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.classList.add('dissolve'));
  document.querySelectorAll('.player-hand .card, .banker-hand .card').forEach(card => card.classList.add('dissolve'));

  setTimeout(() => {
    document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.remove());
    document.querySelectorAll('.player-hand .card, .banker-hand .card').forEach(card => card.remove());
    gameState.gamePhase = "betting";
    setClearBtnState();
    FullRenderItems(gameState);
  }, 1000);
}

function updateRoundHUD({ payout, loss, primeBet }) {
  const funds = document.getElementById("funds");
  const activeBet = document.getElementById("active-bet");
  const payouts = document.getElementById("payouts");
  const losses = document.getElementById("losses");

  if (funds) funds.textContent = gameState.funds;
  if (activeBet) activeBet.textContent = 0;
  if (payouts) {
    if (primeBet) {
      payouts.innerHTML = `<span style="color:purple;">${gameState.totalPayouts}</span>`;
    } else {
      payouts.textContent = gameState.totalPayouts;
    }
  }
  if (losses) losses.textContent = gameState.totalLosses;

  const fundsAlt = document.getElementById("funds-alt");
  const activeBetAlt = document.getElementById("active-bet-alt");
  const payoutsAlt = document.getElementById("payouts-alt");
  const lossesAlt = document.getElementById("losses-alt");

  if (fundsAlt) fundsAlt.textContent = gameState.funds;
  if (activeBetAlt) activeBetAlt.textContent = 0;
  if (payoutsAlt) payoutsAlt.textContent = gameState.totalPayouts;
  if (lossesAlt) lossesAlt.textContent = gameState.totalLosses;
}

// ========== Main Round Logic ==========
export function endRound(winner, playerPoints, bankerPoints) {
  let payout = 0;
  let loss = 0;
  let msg = "";

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

  // --- Boon payout logic (only ACTIVE boons) ---
  let originalPayout = payout;
  let stepPayout = payout;

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  //this array is a lil special
  let steps = []; // Array to track each step of the payout calculation

  // Shub's Boon (All Mother's Boon)
  gameState.shubBonusApplied = false;
  if (
    gameState.activeBoons && gameState.activeBoons.includes('shubsboon') &&
    winner === "player" &&
    gameState.betAmounts.player > 0
  ) {
    stepPayout *= 3;
    gameState.shubBonusApplied = true;
    steps.push({ color: "limegreen", text: `payout: ${originalPayout} × 3 = ${stepPayout}` });
  }

  // Nya's Boon (Nyarlathotep's Boon)
  gameState.nyaBonusApplied = false;
  let primeBet = false;
  let nyaPayoutBefore = stepPayout;
  if (
    gameState.activeBoons && gameState.activeBoons.includes('nyasboon') &&
    gameState.betAmounts[winner] > 0 &&
    isPrime(winner === "player" ? playerPoints : bankerPoints)
  ) {
    stepPayout += 50;
    gameState.nyaBonusApplied = 50;
    primeBet = true;
    steps.push({ color: "purple", text: `payout: ${nyaPayoutBefore} + 50 = ${stepPayout}` });
  }

  // YK Favor (Blessing of the Yellow King)
  gameState.ykBonusApplied = false;
  if (
    gameState.activeBoons && gameState.activeBoons.includes('ykfavor') &&
    winner === "player" &&
    gameState.playerWinStreak === 3
  ) {
    const bonus = Math.floor(stepPayout * 0.10);
    stepPayout += bonus;
    gameState.ykBonusApplied = bonus;
    steps.push({ color: "gold", text: `+10% = ${stepPayout}` });
  }

  // Sigil of Greed
  gameState.sigilBonusApplied = false;
  if (
    gameState.activeBoons && gameState.activeBoons.includes('sigilgreed') &&
    gameState.hasWonByOnePoint
  ) {
    stepPayout *= 2;
    gameState.sigilBonusApplied = true;
    steps.push({ color: "orange", text: `×2 = ${stepPayout}` });
  }

  payout = stepPayout;

  // --- Update Funds and Totals ---
  gameState.funds += payout - loss;
  gameState.currentBet = 0;
  gameState.totalPayouts += payout;
  gameState.totalLosses += loss;
  gameState.lastWinner = winner;
  gameState.lastLossAmount = loss;

  // --- Outcome Messages for Boons ---
  steps.forEach(step => { msg += `<span style="color:${step.color};">${step.text}</span><br>`; });

  // --- Show Outcome and Animate Table ---
  showOutcome(msg, payout, loss, dissolveChipsAndCards);

  // --- Highlight winning score if Nya's Boon is active and bet is prime ---
  const playerScoreElem = document.getElementById('playerScore');
  const bankerScoreElem = document.getElementById('bankerScore');
  if (playerScoreElem) playerScoreElem.style.color = "";
  if (bankerScoreElem) bankerScoreElem.style.color = "";
  if (
    gameState.activeBoons &&
    gameState.activeBoons.includes('nyasboon') &&
    gameState.betAmounts[winner] > 0 &&
    isPrime(winner === "player" ? playerPoints : bankerPoints)
  ) {
    if (winner === "player" && playerScoreElem) playerScoreElem.style.color = "purple";
    if (winner === "banker" && bankerScoreElem) bankerScoreElem.style.color = "purple";
  }

  // --- Check for Game End ---
  if (gameState.funds <= 0) {
    endGame("Game over! You ran out of funds.");
    return;
  }
  if (gameState.reshuffles >= gameState.maxReshuffles && gameState.deck.length <= 4) {
    endGame(gameState.funds > 100 ? "win" : "lost");
    return;
  }

  // --- Reshuffle if Needed ---
  if (gameState.deck.length <= 4 && gameState.reshuffles < gameState.maxReshuffles) {
    showReshufflePopup(() => { shuffleDeck(); });
  }

  // --- Reset Bets for Next Round ---
  if (gameState.betAmounts) {
    gameState.betAmounts.player = 0;
    gameState.betAmounts.banker = 0;
    gameState.betAmounts.tie = 0;
  }
  gameState.selectedZone = null;

  // --- Update UI ---
  addLedgerRow(winner, { primeBet });
  updateRoundHUD({ payout, loss });

  // --- Unlock and Render Boons ---
  updateBoonStats(gameState);
  updateItemStats(gameState);
  checkAndUnlockBoons(gameState);
  checkAndUnlockItems(gameState);
  renderBoonbox(gameState);
  FullRenderItems(gameState);

  // --- Reset per-round boon effects ---
  gameState.diamondReduction = 0;
  gameState.adjustedBankerPoints = 0;
  gameState.nyaBonusApplied = false;
  gameState.ykBonusApplied = false;
  gameState.shubBonusApplied = false;
  gameState.sigilBonusApplied = false;
}

export function resolveRound() {
  if (gameState.gamePhase !== "dealing") {
    showError("Your incompetence is astounding. You must deal cards before ending the round!");
    return;
  }

  const playerPoints = calculatePoints(gameState.playerHand);
  const originalBankerPoints = calculatePoints(gameState.bankerHand);

  // Only adjust if Cthulhu's Boon is active
  let bankerPoints = originalBankerPoints;
  let diamondReduction = 0;
  if (
    gameState.activeBoons &&
    gameState.activeBoons.includes('cthulusboon')
  ) {
    diamondReduction = gameState.bankerHand.filter(
      card => card.suit === "dia" || card.suit === "diamonds"
    ).length;
    if (diamondReduction > 0) {
      bankerPoints = (originalBankerPoints - diamondReduction + 10) % 10;
    }
  }

  gameState.diamondReduction = diamondReduction;
  gameState.adjustedBankerPoints = bankerPoints;

  // --- Debugging: Log Banker Points Adjustment ---
  console.log('Cthulhu active:', gameState.activeBoons.includes('cthulusboon'));
  console.log('Original banker points:', originalBankerPoints);
  console.log('Adjusted banker points:', bankerPoints);
  console.log('Unlocked items:', gameState.itemUnlocks);
  console.log('Used items:', gameState.usedItems);
  console.log('Deck length:', gameState.deck.length, 'Reshuffles:', gameState.reshuffles, 'Max:', gameState.maxReshuffles);

  // --- Determine Winner using the correct bankerPoints ---
  let winner = "";
  if (playerPoints > bankerPoints) winner = "player";
  else if (bankerPoints > playerPoints) winner = "banker";
  else winner = "tie";

  // Remove any existing glow first
  document.querySelectorAll('.bet-zone').forEach(zone => zone.classList.remove('bet-glow'));

  // Add glow to the winning zone
  let glowZone = null;
  if (winner === "player") glowZone = document.querySelector('.player-bet');
  else if (winner === "banker") glowZone = document.querySelector('.banker-bet');
  else if (winner === "tie") glowZone = document.querySelector('.tie-bet');
  if (glowZone) glowZone.classList.add('bet-glow');

  // --- Pass winner to endRound ---
  endRound(winner, playerPoints, bankerPoints);

  // Remove glow when the user clicks anywhere (like outcome message)
  const removeGlow = () => {
    document.querySelectorAll('.bet-zone').forEach(zone => zone.classList.remove('bet-glow'));
    document.removeEventListener('click', removeGlow);
  };
  setTimeout(() => { document.addEventListener('click', removeGlow); }, 300);

  // Set phase to 'resolving' so End Round can't be pressed again until next deal
  gameState.gamePhase = "resolving";
}

// ========== Game State Utilities ==========
export function resetGameState() {
  // --- Reset core game state ---
  gameState.funds = 100;
  gameState.currentBet = 0;
  gameState.totalPayouts = 0;
  gameState.totalLosses = 0;
  gameState.reshuffles = 0;
  gameState.deck = [];
  gameState.playerHand = [];
  gameState.bankerHand = [];
  gameState.betAmounts = { player: 0, banker: 0, tie: 0 };
  gameState.selectedZone = null;
  gameState.gamePhase = "betting";
  gameState.gameOver = false;
  gameState.lastWinner = null;
  gameState.playerWinStreak = 0;
  gameState.hasWonByOnePoint = false;
  gameState.playerDiamondsHeld = 0;
  gameState.playerSpadesHeld = 0;
  gameState.playerClubsHeld = 0;
  gameState.diamondReduction = 0;
  gameState.adjustedBankerPoints = 0;
  gameState.nyaBonusApplied = false;
  gameState.ykBonusApplied = false;
  gameState.shubBonusApplied = false;
  gameState.sigilBonusApplied = false;
  gameState.activeItem = null;

  // --- Reset all boons to false and clear active boons ---
  gameState.boonUnlocks = {
    cthulusboon: false,
    nyasboon: false,
    shubsboon: false,
    ykfavor: false,
    sigilgreed: false
  };
  gameState.activeBoons = [];

  // --- Clear UI: hands, chips, outcome, ledger, overlays ---
  document.querySelectorAll('.player-hand, .banker-hand').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.remove());
  document.getElementById('outcomeBox')?.classList.remove('show');
  document.getElementById('outcomeBox')?.classList.remove('active');
  document.getElementById('playerScore') && (document.getElementById('playerScore').textContent = 'P:0');
  document.getElementById('bankerScore') && (document.getElementById('bankerScore').textContent = 'B:0');
  document.getElementById('playerScore') && (document.getElementById('playerScore').style.color = "");
  document.getElementById('bankerScore') && (document.getElementById('bankerScore').style.color = "");

  // Ledger
  const ledgerBody = document.getElementById('ledger-body');
  if (ledgerBody) ledgerBody.innerHTML = '';
  const ledgerBodyAlt = document.getElementById('ledger-body-alt');
  if (ledgerBodyAlt) ledgerBodyAlt.innerHTML = '';

  // HUDs
  document.getElementById('funds') && (document.getElementById('funds').textContent = 100);
  document.getElementById('active-bet') && (document.getElementById('active-bet').textContent = 0);
  document.getElementById('payouts') && (document.getElementById('payouts').textContent = 0);
  document.getElementById('losses') && (document.getElementById('losses').textContent = 0);
  document.getElementById('funds-alt') && (document.getElementById('funds-alt').textContent = 100);
  document.getElementById('active-bet-alt') && (document.getElementById('active-bet-alt').textContent = 0);
  document.getElementById('payouts-alt') && (document.getElementById('payouts-alt').textContent = 0);
  document.getElementById('losses-alt') && (document.getElementById('losses-alt').textContent = 0);

  // Reset win counters in the HUD
  document.getElementById('playerWin-count') && (document.getElementById('playerWin-count').textContent = 0);
  document.getElementById('bankerWin-count') && (document.getElementById('bankerWin-count').textContent = 0);
  document.getElementById('tie-count') && (document.getElementById('tie-count').textContent = 0);
  document.getElementById('playerWin-count-alt') && (document.getElementById('playerWin-count-alt').textContent = 0);
  document.getElementById('bankerWin-count-alt') && (document.getElementById('bankerWin-count-alt').textContent = 0);
  document.getElementById('tie-count-alt') && (document.getElementById('tie-count-alt').textContent = 0);

  // Overlays and modals
  document.getElementById('fullscreen-overlay-lose')?.classList.remove('active');
  document.getElementById('fullscreen-overlay-win')?.classList.remove('active');
  document.body.classList.remove('no-scroll');
  document.getElementById('main-menu-overlay')?.classList.remove('active');
  document.getElementById('reshuffle-popup')?.classList.remove('active');
  document.getElementById('start-menu-overlay')?.classList.remove('active');

  // --- Reset betting UI/buttons ---
  if (typeof setClearBtnState === 'function') setClearBtnState();

  // --- Optionally reshuffle deck ---
  if (typeof shuffleDeck === 'function') shuffleDeck();

  // --- Reset boon UI ---
  if (typeof renderBoonbox === 'function') renderBoonbox(gameState);
  if (typeof FullRenderItems === 'function') FullRenderItems(gameState);
}

// ========== Exports ==========
window.resolveRound = resolveRound;



