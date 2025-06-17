/* ==========================================
   items.js
   Defines one-use items, their effects, and manages unlocking/activation
   ========================================== */

// ========== Imports ==========
import { gameState } from './game-state.js';
import { drawCard, showReshufflePopup, shuffleDeck } from './deck.js';
import { FullRenderItems, renderHands, updateScores } from './ui-utils.js';
import { cloneDeep } from './utils.js';
import { calculatePoints } from './game-logic.js';
import { createCardElement } from './cards.js';

// ========== Item Definitions ==========
export const items = [
  { key: 'madhand', name: "Mad Hand", description: "Redraw player hand.", spriteClass: 'sprite-madhand', unlockCondition: (gs) => (gs.totalPlayerWins >= 3), unlockConditionText: "Unlocks after the player wins 3 rounds.", useWhen: "After Cards are dealt, before end round" },
  { key: 'forbiddenknowl', name: "Forbidden Knowledge", description: "See next 5 cards.", spriteClass: 'sprite-forbiddenknowl', unlockCondition: (gs) => (gs.totalPlayerLosses >= 5), unlockConditionText: "Unlocks after the player loses 5 rounds.", useWhen: "Before Deal" },
  { key: 'eyeofsleep', name: "Eye of Sleep", description: "Swap hands.", spriteClass: 'sprite-eyeofsleep', unlockCondition: (gs) => (gs.totalPlayerLosses >= 3), unlockConditionText: "Unlocks after the player loses 3 rounds.", useWhen: "After Cards are dealt, before end round" },
  { key: 'whiseroutergods', name: "Whisper of the Outer Gods", description: "Reshuffle deck.", spriteClass: 'sprite-whiseroutergods', unlockCondition: (gs) => (gs.totalBankerWins >= 5), unlockConditionText: "Unlocks after the banker wins 5 rounds.", useWhen: "Before Deal" },
  { key: 'repairedreputation', name: "Repaired Reputation", description: "Last round is forgiven.", spriteClass: 'sprite-repairedreputation', unlockCondition: (gs) => (gs.playerLostMoney >= 20), unlockConditionText: "Unlocks after the player loses $20.", useWhen: "After Cards are dealt, before end round" }
];

// ========== Sprite Config ==========
export const itemSpritePositions = {
  eyeofsleep:         { x: 0,   y: 0   },
  forbiddenknowl:     { x: 283, y: 0   },
  madhand:            { x: 566, y: 0   },
  repairedreputation: { x: 0,   y: 340 },
  whiseroutergods:    { x: 283, y: 340 }
};
export const ITEM_SHEET_WIDTH = 849;
export const ITEM_SHEET_HEIGHT = 680;
export const ITEM_SPRITE_WIDTH = 283;
export const ITEM_SPRITE_HEIGHT = 340;

// ========== State Utilities ==========
function ensureItemState(gs) {
  if (!gs.itemUnlocks) gs.itemUnlocks = {};
  if (!gs.usedItems) gs.usedItems = [];
  if (!('activeItem' in gs)) gs.activeItem = null;
}

// ========== Item Logic ==========
export function checkAndUnlockItems(gs) {
  ensureItemState(gs);
  items.forEach(item => {
    if (!gs.itemUnlocks[item.key] && item.unlockCondition(gs)) {
      gs.itemUnlocks[item.key] = true;
    }
  });
}

export function getUnlockedItems(gs) {
  ensureItemState(gs);
  return items.filter(item => gs.itemUnlocks[item.key] && !gs.usedItems.includes(item.key));
}

export function useItem(gs, itemKey) {
  ensureItemState(gs);
  if (gs.itemUnlocks[itemKey] && !gs.usedItems.includes(itemKey)) {
    // --- Repaired Reputation effect ---
    if (itemKey === 'repairedreputation' && gs._preRoundSnapshot) {
      // Move all cards played to discard
      gs.discard = gs.discard || [];
      if (gs.playerHand) gs.discard.push(...gs.playerHand);
      if (gs.bankerHand) gs.discard.push(...gs.bankerHand);

      // Restore previous state
      const snap = gs._preRoundSnapshot;
      gs.funds = snap.funds;
      gs.totalPayouts = snap.totalPayouts;
      gs.totalLosses = snap.totalLosses;
      gs.playerWinStreak = snap.playerWinStreak;
      gs.hasWonByOnePoint = snap.hasWonByOnePoint;
      gs.lastWinner = snap.lastWinner;
      gs.lastLossAmount = snap.lastLossAmount;
      gs.boonUnlocks = cloneDeep(snap.boonUnlocks);
      gs.itemUnlocks = cloneDeep(snap.itemUnlocks);
      gs.usedItems = [...snap.usedItems];
      gs.betAmounts = { ...snap.betAmounts };

      // Clear hands and UI
      gs.playerHand = [];
      gs.bankerHand = [];
      renderHands(gs);

      // Restore ledger and win counters
      if (document.getElementById('ledger-body')) document.getElementById('ledger-body').innerHTML = snap.ledgerHTML || '';
      if (document.getElementById('ledger-body-alt')) document.getElementById('ledger-body-alt').innerHTML = snap.ledgerHTMLAlt || '';
      if (document.getElementById('playerWin-count')) document.getElementById('playerWin-count').textContent = snap.playerWinCount || 0;
      if (document.getElementById('bankerWin-count')) document.getElementById('bankerWin-count').textContent = snap.bankerWinCount || 0;
      if (document.getElementById('tie-count')) document.getElementById('tie-count').textContent = snap.tieCount || 0;
      if (document.getElementById('playerWin-count-alt')) document.getElementById('playerWin-count-alt').textContent = snap.playerWinCountAlt || 0;
      if (document.getElementById('bankerWin-count-alt')) document.getElementById('bankerWin-count-alt').textContent = snap.bankerWinCountAlt || 0;
      if (document.getElementById('tie-count-alt')) document.getElementById('tie-count-alt').textContent = snap.tieCountAlt || 0;

      // Reset phase to betting
      gs.gamePhase = "betting";

      // Clear bets visually and in state
      gs.betAmounts = { player: 0, banker: 0, tie: 0 };
      document.getElementById('active-bet') && (document.getElementById('active-bet').textContent = 0);
      document.getElementById('active-bet-alt') && (document.getElementById('active-bet-alt').textContent = 0);
      // Remove chips from bet zones
      document.querySelectorAll('.bet-zone .chip').forEach(chip => chip.remove());

      // Optionally, update HUDs and re-render items/boons
      if (typeof FullRenderItems === 'function') FullRenderItems(gs);
      if (typeof renderBoonbox === 'function') renderBoonbox(gs);
    }

    // --- Eye of Sleep effect: dissolve hands and swap ---
    if (itemKey === 'eyeofsleep') {
      // Dissolve current hands
      const playerHandElem = document.querySelector('.player-hand');
      const bankerHandElem = document.querySelector('.banker-hand');
      if (playerHandElem) playerHandElem.querySelectorAll('.card').forEach(card => card.classList.add('dissolve'));
      if (bankerHandElem) bankerHandElem.querySelectorAll('.card').forEach(card => card.classList.add('dissolve'));

      // Wait for dissolve animation, then swap hands and re-render
      setTimeout(() => {
        // Swap hands
        const temp = gs.playerHand;
        gs.playerHand = gs.bankerHand;
        gs.bankerHand = temp;
        renderHands(gs);

        // Update both scores
        const playerScoreElem = document.getElementById('playerScore');
        const bankerScoreElem = document.getElementById('bankerScore');
        if (playerScoreElem) {
          const playerPoints = calculatePoints(gs.playerHand);
          playerScoreElem.textContent = `P:${playerPoints}`;
        }
        if (bankerScoreElem) {
          const bankerPoints = calculatePoints(gs.bankerHand);
          bankerScoreElem.textContent = `B:${bankerPoints}`;
        }
      }, 500); // Match dissolve CSS duration
    }

    // Mad Hand effect: redraw player hand
    if (itemKey === 'madhand') {
      // Remove current player hand cards from the table and discard
      gs.discard = gs.discard || [];
      if (gs.playerHand && gs.playerHand.length) {
        gs.discard.push(...gs.playerHand);
      }
      gs.playerHand = [];
      // Draw new hand (2 or 3 cards, matching original hand size)
      const numCards = 2 + (gs.playerHand && gs.playerHand.length === 3 ? 1 : 0);
      for (let i = 0; i < numCards; i++) {
        gs.playerHand.push(drawCard());
      }
      renderHands(gs);

      // Update player score display
      const playerScoreElem = document.getElementById('playerScore');
      if (playerScoreElem) {
        const playerPoints = calculatePoints(gs.playerHand);
        playerScoreElem.textContent = `P:${playerPoints}`;
      }
    }

    // Forbidden Knowledge effect: show next 5 cards
    if (itemKey === 'forbiddenknowl') {
      showForbiddenKnowledgeOverlay(gs.deck);
    }

    // --- Whisper of the Outer Gods effect: reshuffle the deck with popup ---
    if (itemKey === 'whiseroutergods') {
      showReshufflePopup(shuffleDeck);
    }

    // Dissolve animation (optional, see previous answer)
    const itemDiv = document.querySelector(`.item-icon[data-key="${itemKey}"]`);
    if (itemDiv) {
      itemDiv.classList.add('dissolve');
      setTimeout(() => {
        gs.usedItems.push(itemKey);
        if (typeof FullRenderItems === 'function') FullRenderItems(gs);
      }, 500);
    } else {
      gs.usedItems.push(itemKey);
      if (typeof FullRenderItems === 'function') FullRenderItems(gs);
    }
  }
}

export function toggleItem(gs, itemKey) {
  ensureItemState(gs);
  gs.activeItem = (gs.activeItem === itemKey) ? null : itemKey;
}

// ========== DOM/UI Helpers ==========
export function getItemByKey(key) {
  return items.find(i => i.key === key);
}

export function getAllItems() {
  return items;
}

export function createItemElement(itemKey, spriteSheetPath) {
  const ICON_WIDTH = 48;
  const ICON_HEIGHT = 58;
  const SPRITE_WIDTH = 283;
  const SPRITE_HEIGHT = 340;
  const SHEET_WIDTH = 849;
  const SHEET_HEIGHT = 680;

  const scaleX = ICON_WIDTH / SPRITE_WIDTH;
  const scaleY = ICON_HEIGHT / SPRITE_HEIGHT;

  const pos = itemSpritePositions[itemKey];

  const itemDiv = document.createElement('div');
  itemDiv.className = 'item-icon';
  itemDiv.style.width = ICON_WIDTH + 'px';
  itemDiv.style.height = ICON_HEIGHT + 'px';
  itemDiv.style.backgroundImage = `url(${spriteSheetPath})`;
  itemDiv.style.backgroundRepeat = 'no-repeat';
  itemDiv.style.backgroundSize = `${SHEET_WIDTH * scaleX}px ${SHEET_HEIGHT * scaleY}px`;
  itemDiv.style.backgroundPosition = `-${pos.x * scaleX}px -${pos.y * scaleY}px`;

  return itemDiv;
}

export function showForbiddenKnowledgeOverlay(deck) {
  const overlay = document.getElementById('forbidden-knowledge-overlay');
  const cardsDiv = document.getElementById('forbidden-knowledge-cards');
  if (!overlay || !cardsDiv) return;

  cardsDiv.innerHTML = '';

  // Show next 5 cards (or fewer if deck is short)
  for (let i = 0; i < 5 && i < deck.length; i++) {
    const card = deck[i];
    // Use your sprite-based card rendering
    const cardDiv = createCardElement(card, "./sprite/cards/cards.png");
    cardDiv.style.width = '60px';
    cardDiv.style.height = '90px';
    cardDiv.style.margin = '0 0.5em';
    // Optionally, adjust background size if your createCardElement doesn't already scale
    // cardDiv.style.backgroundSize = 'cover'; // or set to the correct sprite sheet scaling
    cardsDiv.appendChild(cardDiv);
  }

  overlay.style.display = 'flex';

  overlay.onclick = () => {
    overlay.style.display = 'none';
    overlay.onclick = null;
  };
}

