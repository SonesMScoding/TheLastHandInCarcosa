/* ==========================================
  boons.js
  Defines boons, their effects, and manages unlocking/activation
   ========================================== */

import { gameState } from './game-state.js';

// --- Boon Definitions ---
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys

export const boons = [
  {
    key: 'cthulusboon',
    name: "Cthulu's Boon",
    description: "Banker's Diamonds are diminished by 1 point.",
    spriteClass: 'sprite-cthulusboon',
    unlockCondition: (gs) =>
      (gs.playerDiamondsHeld >= 3),
    unlockConditionText: "Unlocks when 3 or more Diamonds have appeared in the Player's hand.",
  },
  {
    key: 'nyasboon',
    name: "Nyarlathotep's Boon",
    description: "Winning hand's final score is a prime number",
    spriteClass: 'sprite-nyasboon',
    unlockCondition: (gs) =>
      (gs.playerSpadesHeld >= 3),
    unlockConditionText: "Unlocks when 3 or more Spades have appeared in the Player's hand.",
  },
  {
    key: 'shubsboon',
    name: "All Mother's Boon",
    description: "Multiplier on won Player Bets.",
    spriteClass: 'sprite-shubsboon',
    unlockCondition: (gs) =>
      (gs.playerClubsHeld >= 3),
    unlockConditionText: "Unlocks when 3 or more Clubs have appeared in the Player's hand.",
  },
  {
    key: 'sigilgreed',
    name: "Sigil of Greed",
    description: "If Banker/Player wins by exactly 1 point, double payout.",
    spriteClass: 'sprite-sigilgreed',
    unlockCondition: (gs) =>
      (gs.hasWonByOnePoint),
    unlockConditionText: "Unlocks when the winning bet is by exactly 1 point.",
  },
  {
    key: 'ykfavor',
    name: "Blessing of the Yellow King",
    description: "Win an extra 10% payout when player wins three times in a row.",
    spriteClass: 'sprite-ykfavor',
    unlockCondition: (gs) =>
      (gs.playerWinStreak >= 3),
    unlockConditionText: "Unlocks when the Player wins 3 times in a row.",
  },
];

export const boonSpritePositions = {
  cthulusboon:  { x: 0,   y: 0   },
  nyasboon:     { x: 283, y: 0   },
  shubsboon:    { x: 566, y: 0   },
  sigilgreed:   { x: 0,   y: 340 },
  ykfavor:      { x: 283, y: 340 }
};

export const BOON_SHEET_WIDTH = 849;
export const BOON_SHEET_HEIGHT = 680;
export const BOON_SPRITE_WIDTH = 283;
export const BOON_SPRITE_HEIGHT = 340;

// --- Utility Functions ---
function ensureBoonState(gs) {
  if (!gs.boonUnlocks) gs.boonUnlocks = {};
  if (!gs.activeBoons) gs.activeBoons = [];
}

// Unlock boons if their condition is met (permanent)
export function checkAndUnlockBoons(gs) {
  ensureBoonState(gs);
  boons.forEach(boon => {
    if (!gs.boonUnlocks[boon.key] && boon.unlockCondition(gs)) {
      gs.boonUnlocks[boon.key] = true;
    }
  });
}

// Get all unlocked boons (array of boon objects)
export function getUnlockedBoons(gs) {
  ensureBoonState(gs);
  return boons.filter(boon => gs.boonUnlocks[boon.key]);
}

// Get all active boons (array of boon keys)
export function getActiveBoons(gs) {
  ensureBoonState(gs);
  return gs.activeBoons;
}

// Toggle boon activation (max 3 active)
export function toggleBoon(gs, boonKey) {
  ensureBoonState(gs);
  const idx = gs.activeBoons.indexOf(boonKey);
  if (idx !== -1) {
    gs.activeBoons.splice(idx, 1);
  } else if (gs.activeBoons.length < 3) {
    gs.activeBoons.push(boonKey);
  }
  console.log('Active boons:', gs.activeBoons); // Add this line
}

// Get boon data by key
export function getBoonByKey(key) {
  return boons.find(b => b.key === key);
}

// For demo/testing: show all boons in the boon box
export function getAllBoons() {
  return boons;
}

export function createBoonElement(boonKey, spriteSheetPath) {
  const ICON_WIDTH = 48;
  const ICON_HEIGHT = 58;
  const SPRITE_WIDTH = 283;
  const SPRITE_HEIGHT = 340;
  const SHEET_WIDTH = 849;
  const SHEET_HEIGHT = 680;

  const scaleX = ICON_WIDTH / SPRITE_WIDTH;
  const scaleY = ICON_HEIGHT / SPRITE_HEIGHT;

  const pos = boonSpritePositions[boonKey];

  const boonDiv = document.createElement('div');
  boonDiv.className = 'boon-icon';
  boonDiv.style.width = ICON_WIDTH + 'px';
  boonDiv.style.height = ICON_HEIGHT + 'px';
  boonDiv.style.backgroundImage = `url(${spriteSheetPath})`;
  boonDiv.style.backgroundRepeat = 'no-repeat';
  boonDiv.style.backgroundSize = `${SHEET_WIDTH * scaleX}px ${SHEET_HEIGHT * scaleY}px`;
  boonDiv.style.backgroundPosition = `-${pos.x * scaleX}px -${pos.y * scaleY}px`;

  return boonDiv;
}


