// game-main.js
// Main game logic and UI interactions for Baccarat
// Handles initialization, event listeners, overlays, and music

import { initializeChips } from './chips.js';
import { setupBetZones, setClearBtnState } from './betting-chips.js';
import { updateFundsHUD, setupShoeTooltip, renderBoonbox, FullRenderItems, FullRenderItembox } from './ui-utils.js';
import { dealCards } from './dealing.js';
import { shuffleDeck, showReshufflePopup } from './deck.js';
import { setupShoeOverlay } from './shoe-toggle.js';
import { resolveRound, resetGameState } from './round-control.js';
import { gameState } from './game-state.js';
import { checkAndUnlockBoons } from './boons.js';
import { getAllItems, createItemElement } from './items.js';
import { updateItemStats } from './item-stats.js';

// --- Debug Exports (remove for production) ---
window.gameState = gameState;
window.checkAndUnlockBoons = checkAndUnlockBoons;
window.renderBoonbox = renderBoonbox;
window.updateItemStats = updateItemStats;
window.FullRenderItems = FullRenderItems;
window.showReshufflePopup = showReshufflePopup;

// --- DOMContentLoaded: Main Game Setup ---
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const fadeOverlay = document.getElementById('fade-overlay');
  const creditText = document.getElementById('credit-text');
  const startScreen = document.getElementById('start-screen');
  const creditBtn = document.getElementById('credit-btn');
  const startBtn = document.getElementById('start-btn');
  const rulebookBtn = document.getElementById('rulebook-btn');
  const gameUI = document.getElementById('game-ui');

  // --- Initialize Game UI and State ---
  initializeChips();
  setupBetZones(50, "./sprite/chips/chips.png", {
    "1": "0px 0px",
    "5": "-50px -50px",
    "10": "-50px 0px",
    "25": "0px -50px",
    "100": "-100px 0px"
  });
  updateFundsHUD();
  setClearBtnState();
  shuffleDeck();

  // --- Table and Shoe Interactions ---
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
  // Ensure only the menu overlay rulebook button opens rules.html in a new tab
  const menuRulebookBtn = document.querySelector('#main-menu-overlay #rulebook-btn');
  if (menuRulebookBtn) {
    menuRulebookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('rules.html', '_blank');
    });
  }
  // The start screen rulebook button should also work (if needed)
  const startRulebookBtn = document.querySelector('#start-screen #rulebook-btn');
  if (startRulebookBtn) {
    startRulebookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('rules.html', '_blank');
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
      window.location.href = 'baccarat.html';
    });
  }

  // --- Render Boonbox and Items ---
  renderBoonbox(gameState);
  FullRenderItems(gameState);

  // --- Overlay and Start Screen Transitions ---
  setTimeout(() => {
    creditText.classList.add('hide');
    setTimeout(() => {
      fadeOverlay.classList.add('hide');
      startScreen.style.display = 'flex';
      setTimeout(() => {
        fadeOverlay.style.display = 'none';
      }, 1000);
    }, 1500);
  }, 1200);

  fadeOverlay.style.display = 'flex';
  fadeOverlay.classList.add('visible');
  setTimeout(() => {
    creditText.classList.add('visible');
    setTimeout(() => {
      creditText.classList.remove('visible');
      setTimeout(() => {
        fadeOverlay.classList.remove('visible');
        startScreen.style.display = 'flex';
        setTimeout(() => {
          fadeOverlay.style.display = 'none';
        }, 1000);
      }, 1000);
    }, 3000);
  }, 500);

  // --- Credits Button ---
  creditBtn.onclick = () => {
    fadeOverlay.style.display = 'flex';
    void fadeOverlay.offsetWidth;
    fadeOverlay.classList.add('visible');
    creditText.classList.add('visible');
  };

  // --- Dismiss Credits Popup ---
  fadeOverlay.onclick = () => {
    fadeOverlay.classList.remove('visible');
    creditText.classList.remove('visible');
    setTimeout(() => {
      fadeOverlay.style.display = 'none';
    }, 1000);
  };

  // --- Start Game Button ---
  startBtn.onclick = () => {
    startScreen.style.display = 'none';
    gameUI.style.display = '';
  };

  // --- Background Music Logic ---
  let musicStarted = false;
  function tryPlayMusic() {
    if (musicStarted) return;
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
      musicStarted = true;
    }).catch(() => {
      // Play on first user interaction if blocked
      const handler = () => {
        bgMusic.play();
        musicStarted = true;
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('click', handler);
      document.addEventListener('keydown', handler);
    });
  }
  tryPlayMusic();
});





