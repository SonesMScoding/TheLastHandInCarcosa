/* ==========================================
   ui-utils.js
   reveals scores, updates HUDs, shows outcomes, and manages overlays
   Handles Baccarat-specific UI interactions
   Provides utility functions for game state updates
   [Add your informational notes here.]
   ========================================== */

import { gameState } from './game-state.js';

// Reveal scores card by card, using Baccarat rules
// https://www.w3schools.com/js/js_async.asp
export async function revealScoresByCard(playerHand, bankerHand) {
  let playerSum = 0;
  let bankerSum = 0;

  // Helper to get Baccarat value
  function baccaratValue(card) {
    if (!card || !card.value) return 0;
    if (['J', 'Q', 'K', '10', 'A'].includes(card.value)) return 0;
    return parseInt(card.value) || 0;
  }

  // Reveal player cards one by one
  const playerCardElems = document.querySelectorAll('.player-hand .card');
  for (let i = 0; i < playerHand.length; i++) {
    playerSum += baccaratValue(playerHand[i]);
    document.getElementById('playerScore').textContent = `P:${playerSum % 10}`;
    // Flip the card visually
    if (playerCardElems[i]) playerCardElems[i].classList.add('flipped');
    await new Promise(res => setTimeout(res, 400));
  }

  // Reveal banker cards one by one
  const bankerCardElems = document.querySelectorAll('.banker-hand .card');
  for (let i = 0; i < bankerHand.length; i++) {
    bankerSum += baccaratValue(bankerHand[i]);
    document.getElementById('bankerScore').textContent = `B:${bankerSum % 10}`;
    // Flip the card visually
    if (bankerCardElems[i]) bankerCardElems[i].classList.add('flipped');
    await new Promise(res => setTimeout(res, 400));
  }
}

// Update funds and bet display in both HUDs
export function updateFundsHUD() {
  const funds = document.getElementById("funds");
  const activeBet = document.getElementById("active-bet");
  if (funds) funds.textContent = gameState.funds;
  if (activeBet) activeBet.textContent = gameState.currentBet;

  const fundsAlt = document.getElementById("funds-alt");
  const activeBetAlt = document.getElementById("active-bet-alt");
  if (fundsAlt) fundsAlt.textContent = gameState.funds;
  if (activeBetAlt) activeBetAlt.textContent = gameState.currentBet;
}

// Show an error overlay, dismissable by click
export function showError(message) {
  const errorBox = document.getElementById("errorBox");
  if (!errorBox) return alert(message);

  errorBox.textContent = message;
  errorBox.style.display = "flex";

  // https://www.geeksforgeeks.org/javascript/window-window-requestanimationframe-method/
  // https://www.kirupa.com/html5/animating_with_requestAnimationFrame.htm
  requestAnimationFrame(() => {
    errorBox.style.opacity = "1";
  });

  // Remove any previous click listeners to avoid stacking
  function dismiss() {
    errorBox.style.opacity = "0";
    setTimeout(() => {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }, 300);
    document.removeEventListener("click", dismiss);
  }
  // Remove any previous listeners before adding a new one
  document.removeEventListener("click", dismiss);
  setTimeout(() => {
    document.addEventListener("click", dismiss);
  }, 100); // slight delay to avoid immediate dismissal from the triggering click
}


export function updateShoeView() {
  //  show remaining cards in the shoe
  // const shoeElem = document.getElementById('shoe-id');
  // if (shoeElem) {
  //   shoeElem.textContent = `Cards left: ${gameState.deck.length}`;
  // }
}

// Show outcome overlay with payout/loss, dismissable by click
export function showOutcome(message, payout, loss, onDismiss) {
  const outcomeBox = document.getElementById("outcomeBox");
  let details = "";
  if (payout > 0) details += `<div style="color:#7fff7f;">Payout: $${payout}</div>`;
  if (loss > 0) details += `<div style="color:#ff7f7f;">Loss: $${loss}</div>`;

  outcomeBox.innerHTML = `${message}${details ? "<hr>" + details : ""}`;
  outcomeBox.style.display = "flex";
  requestAnimationFrame(() => {
    outcomeBox.style.opacity = "1";
  });

  const dismiss = () => {
    outcomeBox.style.opacity = "0";
    setTimeout(() => {
      outcomeBox.style.display = "none";
      outcomeBox.innerHTML = "";
      // Reset scores to zero after outcome is dismissed
      document.getElementById('playerScore').textContent = 'P:0';
      document.getElementById('bankerScore').textContent = 'B:0';
      if (typeof onDismiss === "function") onDismiss();
    }, 400);
    document.removeEventListener("click", dismiss);
  };
  setTimeout(() => {
    document.addEventListener("click", dismiss);
  }, 200);
}

// Ledger and round tracking
let roundNumber = 1;
export function addLedgerRow(winner) {
  function updateLedger(ledgerId) {
    const ledgerBody = document.getElementById(ledgerId);
    if (!ledgerBody) return;

    let bCell = "", pCell = "", tCell = "";
    if (winner === "banker") {
      bCell = `<svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle;"><path fill="#fcd116" d="M10 18s-7-4.35-7-10A5 5 0 0 1 10 3a5 5 0 0 1 7 5c0 5.65-7 10-7 10z"/></svg>`;
    } else if (winner === "player") {
      pCell = `<svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle;"><polygon fill="#e74c3c" points="10,2 12,7.5 18,7.5 13,11.5 15,17 10,13.5 5,17 7,11.5 2,7.5 8,7.5"/></svg>`;
    } else if (winner === "tie") {
      tCell = `<svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle;"><circle cx="10" cy="10" r="8" fill="#3498db"/></svg>`;
    }

    //had to use copilot to assist with aligning the dynamic tr

    const row = document.createElement("tr");
    row.innerHTML = `<td style="font-weight:bold;">${roundNumber}</td><td>${bCell}</td><td>${pCell}</td><td>${tCell}</td>`;
    ledgerBody.appendChild(row);
    ledgerBody.scrollTop = ledgerBody.scrollHeight;
  }

  updateLedger("ledger-body");
  updateLedger("ledger-body-alt");

  // Update win counters
  // https://codepen.io/kraigwalker/pen/DjwedK
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  if (winner === "banker") {
    const el = document.getElementById("bankerWin-count");
    const elAlt = document.getElementById("bankerWin-count-alt");
    if (el) el.textContent = parseInt(el.textContent) + 1;
    if (elAlt) elAlt.textContent = parseInt(elAlt.textContent) + 1;
  } 
  
  else if (winner === "player") {
    const el = document.getElementById("playerWin-count");
    const elAlt = document.getElementById("playerWin-count-alt");
    if (el) el.textContent = parseInt(el.textContent) + 1;
    if (elAlt) elAlt.textContent = parseInt(elAlt.textContent) + 1;
  } 
  
  else if (winner === "tie") {
    const el = document.getElementById("tie-count");
    const elAlt = document.getElementById("tie-count-alt");
    if (el) el.textContent = parseInt(el.textContent) + 1;
    if (elAlt) elAlt.textContent = parseInt(elAlt.textContent) + 1;
  }

  roundNumber++;
}

// Fullscreen overlays for win/lose
export function showWinOverlay() {
  document.getElementById('fullscreen-overlay-win').classList.add('active');
  document.body.classList.add('no-scroll');
  const outcomeBox = document.getElementById('outcomeBox');
  if (outcomeBox) {
    outcomeBox.style.opacity = "0";
    setTimeout(() => {
      outcomeBox.style.display = "none";
      outcomeBox.innerHTML = "";
       //makes sure the "bet wins, whatever payout" overlay is hidden

    }, 300);
  }
}
export function showLoseOverlay() {
  document.getElementById('fullscreen-overlay-lose').classList.add('active');
  document.body.classList.add('no-scroll');
  const outcomeBox = document.getElementById('outcomeBox');
  if (outcomeBox) {
    outcomeBox.style.opacity = "0";
    setTimeout(() => {
      outcomeBox.style.display = "none";
      outcomeBox.innerHTML = "";
    }, 300);
  }
}
export function hideWinOverlay() {
  const winOverlay = document.getElementById('fullscreen-overlay-win');
  winOverlay.classList.remove('active');
  winOverlay.style.display = 'none';
  document.body.classList.remove('no-scroll');
  // makes sure the game behind the overlay doesnt scroll and interfere with the users priorities
}
export function hideLoseOverlay() {
  const loseOverlay = document.getElementById('fullscreen-overlay-lose');
  loseOverlay.classList.remove('active');
  loseOverlay.style.display = 'none';
  document.body.classList.remove('no-scroll');
}

// Main menu overlay controls
function showMenuOverlay() {
  document.getElementById('main-menu-overlay').classList.add('active');
}
function hideMenuOverlay() {
  document.getElementById('main-menu-overlay').classList.remove('active');
}

// !!!!! must event listeners after DOM is loaded ^^
document.addEventListener('DOMContentLoaded', () => {
  // Open menu from any menu button
  document.querySelectorAll('.open-menu-btn').forEach(btn => {
    btn.addEventListener('click', showMenuOverlay);
  });

  // Close menu
  document.getElementById('close-menu-btn').addEventListener('click', hideMenuOverlay);

  // Rulebook
  document.getElementById('rulebook-btn').addEventListener('click', () => {
    alert('Show Rulebook (implement this)');
  });

  // Restart Game
  document.getElementById('restart-game-btn').addEventListener('click', () => {
    window.location.reload();
  });

  // Return to Start
  document.getElementById('return-start-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});

// Tooltip for shoe hover
// This function sets up a tooltip that follows the mouse cursor when hovering over the shoe element
// https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
export function setupShoeTooltip() {
  const shoe = document.querySelector('.shoe');
  const tooltip = document.getElementById('shoe-tooltip');

  if (shoe && tooltip) {
    shoe.addEventListener('mouseenter', () => {
      tooltip.classList.add('visible');
    });
    shoe.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY + 16) + 'px';
    });
    shoe.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  }
}