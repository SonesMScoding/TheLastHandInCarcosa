import { initializeChips } from './ChipsCreate.js';
import { setupBetZones, setClearBtnState } from './bettingChips.js';
import { updateFundsHUD, setupShoeTooltip } from './uiScript.js';
import { dealCards } from './dealing.js';
import { shuffleDeck } from './deck.js';
import { setupShoeOverlay } from './shoeToggle.js';
import { resolveRound, resetGameState } from './roundControl.js';

document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize Game UI and State ---
  initializeChips();
  setupBetZones(50, "./sprite/chips/chipsSpritesheet.png", {
    "1": "0px 0px",
    "5": "-50px -50px",
    "10": "-50px 0px",
    "25": "0px -50px",
    "100": "-100px 0px"
  });
  updateFundsHUD();
  setClearBtnState();
  shuffleDeck();

  // --- Setup Table and Shoe Interactions ---
  setupShoeOverlay();
  setupShoeTooltip();

  // --- Button Event Listeners ---
  const dealBtn = document.getElementById("dealBtn");
  if (dealBtn) dealBtn.addEventListener("click", dealCards);

  const endRoundBtn = document.getElementById('endRoundBtn');
  if (endRoundBtn) endRoundBtn.addEventListener('click', resolveRound);

  // --- Menu Overlay Logic ---
  const mainMenuOverlay = document.getElementById('main-menu-overlay');
  const showMenuOverlay = () => mainMenuOverlay.classList.add('active');
  const hideMenuOverlay = () => mainMenuOverlay.classList.remove('active');

  document.querySelectorAll('.open-menu-btn').forEach(btn => {
    btn.addEventListener('click', showMenuOverlay);
  });

  const closeMenuBtn = document.getElementById('close-menu-btn');
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', hideMenuOverlay);

  // --- Rulebook Button ---
  const rulebookBtn = document.getElementById('rulebook-btn');
  if (rulebookBtn) {
    rulebookBtn.addEventListener('click', () => {
      alert('Show Rulebook (implement this)');
    });
  }

  // --- Restart Game Buttons ---
  const restartBtnLose = document.getElementById('restart-btn-lose');
  if (restartBtnLose) restartBtnLose.addEventListener('click', resetGameState);

  const restartBtnWin = document.getElementById('restart-btn-win');
  if (restartBtnWin) restartBtnWin.addEventListener('click', resetGameState);

  // --- Return to Start Button ---
  const returnStartBtn = document.getElementById('return-start-btn');
  if (returnStartBtn) {
    returnStartBtn.addEventListener('click', () => {
      window.location.href = 'game2.html';
    });
  }
});