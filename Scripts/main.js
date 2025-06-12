import { setupChips } from './ChipsCreate.js';
import { setupBetZones } from './bettingChips.js';
import { updateFundsHUD } from './uiScript.js';
import { dealCards } from './dealing.js';
import { setClearBtnState } from './bettingChips.js';
import { shuffleDeck } from './deck.js';
import { setupShoeOverlay } from './shoeToggle.js';
import { resolveRound } from './roundControl.js';

document.addEventListener("DOMContentLoaded", () => {
  const chipPositions = {
    "1": "0px 0px",
    "5": "-50px -50px",
    "10": "-50px 0px",
    "25": "0px -50px",
    "100": "-100px 0px"
  };
  const spriteSheetPath = "./sprite/chips/chipsSpritesheet.png";
  const chipSize = 50;

  setupChips(chipSize, spriteSheetPath, chipPositions);
  setupBetZones(chipSize, spriteSheetPath, chipPositions);
  updateFundsHUD();
  setClearBtnState(); // <-- This ensures buttons are correct on load

  shuffleDeck();
  const dealBtn = document.getElementById("dealBtn");
  if (dealBtn) {
    dealBtn.addEventListener("click", dealCards);
  }

  setupShoeOverlay();

  const endRoundBtn = document.getElementById('endRoundBtn');
  if (endRoundBtn) {
    endRoundBtn.addEventListener('click', resolveRound);
  }
});