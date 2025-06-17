/* ==========================================
   ui-utils.js
   Utility functions for Baccarat UI
   ========================================== */

import { gameState } from './game-state.js';
import { getUnlockedBoons, toggleBoon, getAllBoons, createBoonElement } from './boons.js';
import { getUnlockedItems, toggleItem, createItemElement, useItem, getItemByKey } from './items.js';
import { getAllItems } from './items.js';
import { createCardElement } from './cards.js';
import { calculatePoints } from './game-logic.js';
import { resetGameState } from './round-control.js';


// ===================== General UI =====================
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

export function updateScores(gameState) {
  const playerScoreElem = document.getElementById('playerScore');
  const bankerScoreElem = document.getElementById('bankerScore');
  if (playerScoreElem) playerScoreElem.textContent = `P:${calculatePoints(gameState.playerHand)}`;
  if (bankerScoreElem) bankerScoreElem.textContent = `B:${calculatePoints(gameState.bankerHand)}`;
}

// ===================== Overlays & Modals =====================
export async function revealScoresByCard(playerHand, bankerHand) {
  let playerSum = 0;
  let bankerSum = 0;

  // Helper to get Baccarat value
  function baccaratValue(card) {
    if (!card || !card.value) return 0;
    if (["J", "Q", "K", "10", "A"].includes(card.value)) return 0;
    return parseInt(card.value) || 0;
  }

  // Reveal player cards one by one
  // ASNYC / AWAIT animation 
  const playerCardElems = document.querySelectorAll('.player-hand .card');
  for (let i = 0; i < playerHand.length; i++) {
    playerSum += baccaratValue(playerHand[i]);
    document.getElementById('playerScore').textContent = `P:${playerSum % 10}`;
    // Flip the card visually
    if (playerCardElems[i]) playerCardElems[i].classList.add('flipped');
    await new Promise(res => setTimeout(res, 400));
  }

  // Reveal banker cards one by one
    // ASNYC / AWAIT animation 
  const bankerCardElems = document.querySelectorAll('.banker-hand .card');
  for (let i = 0; i < bankerHand.length; i++) {
    bankerSum += baccaratValue(bankerHand[i]);
    document.getElementById('bankerScore').textContent = `B:${bankerSum % 10}`;
    // Flip the card visually
    if (bankerCardElems[i]) bankerCardElems[i].classList.add('flipped');
    await new Promise(res => setTimeout(res, 400));
  }
}

export function showError(message) {
  const errorBox = document.getElementById("errorBox");
  if (!errorBox) return alert(message);

  errorBox.textContent = message;
  errorBox.style.display = "flex";

  //https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
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

export function showWinOverlay() {
  const overlay = document.getElementById('fullscreen-overlay-win');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
  const outcomeBox = document.getElementById('outcomeBox');
  if (outcomeBox) {
    outcomeBox.style.opacity = "0";
    setTimeout(() => {
      outcomeBox.style.display = "none";
      outcomeBox.innerHTML = "";
    }, 300);
  }
}
export function showLoseOverlay() {
  const overlay = document.getElementById('fullscreen-overlay-lose');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
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
  if (winOverlay) {
    winOverlay.classList.remove('active');
    winOverlay.style.display = 'none';
  }
  document.body.classList.remove('no-scroll');
}
export function hideLoseOverlay() {
  const loseOverlay = document.getElementById('fullscreen-overlay-lose');
  if (loseOverlay) {
    loseOverlay.classList.remove('active');
    loseOverlay.style.display = 'none';
  }
  document.body.classList.remove('no-scroll');
}

// ===================== Ledger =====================
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

    const row = document.createElement("tr");
    row.innerHTML = `<td style="font-weight:bold;">${roundNumber}</td><td>${bCell}</td><td>${pCell}</td><td>${tCell}</td>`;
    ledgerBody.appendChild(row);
    ledgerBody.scrollTop = ledgerBody.scrollHeight;
  }

  updateLedger("ledger-body");
  updateLedger("ledger-body-alt");

  // Update win counters
  function updateCounter(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = (parseInt(el.textContent) || 0) + 1;
  }
  if (winner === "banker") {
    updateCounter("bankerWin-count");
    updateCounter("bankerWin-count-alt");
  } else if (winner === "player") {
    updateCounter("playerWin-count");
    updateCounter("playerWin-count-alt");
  } else if (winner === "tie") {
    updateCounter("tie-count");
    updateCounter("tie-count-alt");
  }

  roundNumber++;
}

// ===================== Menu Overlay =====================
function showMenuOverlay() {
  const menu = document.getElementById('main-menu-overlay');
  if (menu) menu.classList.add('active');
}
function hideMenuOverlay() {
  const menu = document.getElementById('main-menu-overlay');
  if (menu) menu.classList.remove('active');
}

// Event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.open-menu-btn').forEach(btn => {
    btn.addEventListener('click', showMenuOverlay);
  });

  // Close menu button
  const closeMenuBtn = document.getElementById('close-menu-btn');
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', hideMenuOverlay);

  //Rulebook button
  const rulebookBtn = document.getElementById('rulebook-btn');
  if (rulebookBtn) rulebookBtn.addEventListener('click', () => {
    window.open('rules.html', '_blank');
  });

  //Restart game button
  const restartBtn = document.getElementById('restart-game-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetGameState();
      const menu = document.getElementById('main-menu-overlay');
      if (menu) menu.classList.remove('active');
    });
  }

  const returnStartBtn = document.getElementById('return-start-btn');
  const startScreen = document.getElementById('start-screen');
  const gameUI = document.getElementById('game-ui');
  const fadeOverlay = document.getElementById('fade-overlay');

  //better implementation of overlay hiding
  if (returnStartBtn) {
    returnStartBtn.addEventListener('click', () => {
      // Hide game UI
      if (gameUI) gameUI.style.display = 'none';
      // Hide credits overlay if visible
      if (fadeOverlay) {
        fadeOverlay.style.display = 'none';
        fadeOverlay.classList.remove('visible');
      }
      // Show start screen
      if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.classList.add('visible');
      }
    });
  }


  FullRenderItems(gameState);
  setupUseItemButton(gameState);
});

// ===================== Tooltips =====================

//shoe tooltip
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

//boon tooltip
function showBoonTooltip(event, boon) {
  const tooltip = document.getElementById('boon-tooltip');
  if (!tooltip) return;
  tooltip.innerHTML = `<strong>${boon.name}</strong><br>${boon.description}<br><em>Unlock: ${boon.unlockConditionText || "See code"}</em>`;
  tooltip.classList.add('visible');
  tooltip.style.left = '0px';
  tooltip.style.top = '0px';
  tooltip.style.display = 'block';

  //https://www.w3schools.com/jsref/met_element_getboundingclientrect.asp
  //Chat gpt helped me figure out how to not have the info bits clipped in the screen

  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 12;
  let left = event.clientX - tooltipRect.width - padding;
  let top = event.clientY - tooltipRect.height - padding;
  if (left < padding) left = padding;
  if (top < padding) top = padding;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
function hideBoonTooltip() {
  const tooltip = document.getElementById('boon-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

//item tooltip
function showItemTooltip(event, item) {
  const tooltip = document.getElementById('item-tooltip');
  if (!tooltip) return;
  tooltip.innerHTML = `<strong>${item.name}</strong><br>${item.description}<br><em>Unlock: ${item.unlockConditionText || "See code"}</em><br><em>Use: ${item.useWhen}</em>`;
  tooltip.classList.add('visible');
  tooltip.style.display = 'block';

  // Temporarily set to measure size
  tooltip.style.left = '0px';
  tooltip.style.top = '0px';

  // Measure tooltip
  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 12;

  // Position to upper left of cursor
  let left = event.clientX - tooltipRect.width - padding;
  let top = event.clientY - tooltipRect.height - padding;

  // Prevent clipping
  if (left < padding) left = padding;
  if (top < padding) top = padding;
  if (left + tooltipRect.width + padding > window.innerWidth) left = window.innerWidth - tooltipRect.width - padding;
  if (top + tooltipRect.height + padding > window.innerHeight) top = window.innerHeight - tooltipRect.height - padding;

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
function hideItemTooltip() {
  const tooltip = document.getElementById('item-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    tooltip.style.display = 'none';
  }
}

// ===================== Boons =====================
export function renderBoonbox(gameState) {
  const boonboxDiv = document.getElementById('boon-box');
  if (!boonboxDiv) return;
  boonboxDiv.innerHTML = '';
  const unlocked = getUnlockedBoons(gameState);
  unlocked.forEach(boon => {
    const boonDiv = createBoonElement(boon.key, './sprite/boons/boons.png');
    boonDiv.title = `${boon.name}: ${boon.description}`;
    if (gameState.activeBoons.includes(boon.key)) boonDiv.classList.add('boon-active');
    boonDiv.addEventListener('click', () => {
      if (gameState.gamePhase !== "betting") {
        showError("Boons can only be toggled during the betting phase.");
        return;
      }
      const isActive = gameState.activeBoons.includes(boon.key);
      if (!isActive && gameState.activeBoons.length >= 3) {
        showError("You do not possess the strength to wield more than three boons at a time.");
        return;
      }
      toggleBoon(gameState, boon.key);
      renderBoonbox(gameState);
    });
    boonDiv.addEventListener('mousemove', (e) => showBoonTooltip(e, boon));
    boonDiv.addEventListener('mouseleave', hideBoonTooltip);
    boonboxDiv.appendChild(boonDiv);
  });
}
export function FullRenderBoonbox(gameState) {
  const boonboxDiv = document.getElementById('boon-box');
  if (!boonboxDiv) return;
  boonboxDiv.innerHTML = '';
  getAllBoons().forEach(boon => {
    const boonDiv = createBoonElement(boon.key, './sprite/boons/boons.png');
    boonDiv.title = `${boon.name}: ${boon.description}`;
    if (gameState && gameState.activeBoons && gameState.activeBoons.includes(boon.key)) boonDiv.classList.add('boon-active');
    boonDiv.addEventListener('click', () => {
      const isActive = gameState.activeBoons.includes(boon.key);
      if (!isActive && gameState.activeBoons.length >= 3) {
        showError("You do not possess the strength to wield more than three boons at a time.");
        return;
      }
      toggleBoon(gameState, boon.key);
      FullRenderBoonbox(gameState);
    });
    boonDiv.addEventListener('mousemove', (e) => showBoonTooltip(e, boon));
    boonDiv.addEventListener('mouseleave', hideBoonTooltip);
    boonboxDiv.appendChild(boonDiv);
  });
}

// ===================== Items =====================
export function FullRenderItems(gameState) {
  const itemBox = document.getElementById('item-box');
  if (!itemBox) return;
  itemBox.innerHTML = '';

  const unlockedItems = getUnlockedItems(gameState);
  unlockedItems.forEach(item => {
    const itemDiv = createItemElement(item.key, 'sprite/items/items.png');
    itemDiv.classList.toggle('item-active', gameState.activeItem === item.key);

    itemDiv.onmouseenter = (e) => showItemTooltip(e, item);
    itemDiv.onmousemove = (e) => showItemTooltip(e, item);
    itemDiv.onmouseleave = hideItemTooltip;

    itemDiv.onclick = () => {
      toggleItem(gameState, item.key);
      FullRenderItems(gameState);
      const useBtn = document.getElementById('use-item-btn');
      if (useBtn) useBtn.disabled = !canUseActiveItem(gameState);
    };

    itemBox.appendChild(itemDiv);
  });

  // Enable/disable use button
  const useBtn = document.getElementById('use-item-btn');
  if (useBtn) useBtn.disabled = !canUseActiveItem(gameState);
}
export function FullRenderItembox(gameState) {
  const itemBox = document.getElementById('item-box');
  if (!itemBox) return;
  itemBox.innerHTML = '';
  const allItems = typeof getAllItems === 'function' ? getAllItems() : [];
  allItems.forEach(item => {
    const itemDiv = createItemElement(item.key, 'sprite/items/items.png');
    itemDiv.title = `${item.name}: ${item.description}`;
    itemDiv.classList.toggle('item-active', gameState.activeItem === item.key);

    itemDiv.onmouseenter = (e) => showItemTooltip(e, item);
    itemDiv.onmousemove = (e) => showItemTooltip(e, item);
    itemDiv.onmouseleave = hideItemTooltip;

    itemDiv.onclick = () => {
      toggleItem(gameState, item.key);
      FullRenderItembox(gameState);
      const useBtn = document.getElementById('use-item-btn');
      if (useBtn) useBtn.disabled = !gameState.activeItem;
    };

    itemBox.appendChild(itemDiv);
  });

  // Enable/disable use button
  const useBtn = document.getElementById('use-item-btn');
  if (useBtn) useBtn.disabled = !gameState.activeItem;
}
export function setupUseItemButton(gameState) {
  const useBtn = document.getElementById('use-item-btn');
  if (!useBtn) return;
  useBtn.disabled = !canUseActiveItem(gameState);
  useBtn.onclick = function() {
    if (canUseActiveItem(gameState)) {
      useItem(gameState, gameState.activeItem);
      gameState.activeItem = null;
      FullRenderItems(gameState);
      useBtn.disabled = true;
    }
  };
}
export function canUseActiveItem(gameState) {
  if (!gameState.activeItem) return false;
  const item = getItemByKey(gameState.activeItem);
  if (!item) return false;

  const dealingItems = ['madhand', 'eyeofsleep', 'repairedreputation'];
  const bettingItems = ['forbiddenknowl', 'whiseroutergods'];

  if (dealingItems.includes(item.key)) return gameState.gamePhase === "dealing";
  if (bettingItems.includes(item.key)) return gameState.gamePhase === "betting";
  return false;
}
export function updateUseItemButton(gameState) {
  const useBtn = document.getElementById('use-item-btn');
  if (useBtn) useBtn.disabled = !canUseActiveItem(gameState);
}

// ===================== Hand Rendering =====================
export function renderHands(gameState) {
  const playerHandElem = document.querySelector('.player-hand');
  const bankerHandElem = document.querySelector('.banker-hand');
  const spritePath = "./sprite/cards/cards.png";

  if (playerHandElem) {
    playerHandElem.innerHTML = '';
    if (gameState.playerHand && gameState.playerHand.length) {
      gameState.playerHand.forEach(card => {
        const cardDiv = createCardElement(card, spritePath);
        cardDiv.classList.add('card', 'flipped');
        playerHandElem.appendChild(cardDiv);
      });
    }
  }

  if (bankerHandElem) {
    bankerHandElem.innerHTML = '';
    if (gameState.bankerHand && gameState.bankerHand.length) {
      gameState.bankerHand.forEach(card => {
        const cardDiv = createCardElement(card, spritePath);
        cardDiv.classList.add('card', 'flipped');
        bankerHandElem.appendChild(cardDiv);
      });
    }
  }
}


export function updateShoeView() {}

