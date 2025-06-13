/* ==========================================
   betting-chips.js
   Handles bet zone logic, chip placement, and clear/deal button state for Baccarat
   [Add your informational notes here.]
   ========================================== */

import { gameState } from './game-state.js';
import { updateFundsHUD, showError } from './ui-utils.js';

// --- Setup Bet Zones Logic ---
export function setupBetZones(chipSize, spriteSheetPath, chipPositions) {
  setClearBtnState(); // Set initial state

  document.querySelectorAll(".bet-zone").forEach(zone => {
    zone.addEventListener("dragover", e => {
      if (gameState.gamePhase !== "betting") {
        e.preventDefault();
        return false;
      }
      e.preventDefault();
    });
    zone.addEventListener("drop", e => {
      e.preventDefault();

      if (gameState.gamePhase !== "betting") {
        showError("Your fate has already been sealed. You cannot change your bets now.");
        setClearBtnState();
        return;
      }

      const value = parseInt(e.dataTransfer.getData("chipValue"));
      const zoneType = zone.classList.contains("player-bet")
        ? "player"
        : zone.classList.contains("tie-bet")
        ? "tie"
        : "banker";

      if (gameState.selectedZone && gameState.selectedZone !== zoneType) {
        showError("You can only bet on one zone per round!");
        return;
      }

      if (gameState.funds < value) {
        showError("Insufficient funds.");
        return;
      }

      gameState.selectedZone = zoneType;
      gameState.betAmounts[zoneType] += value;
      gameState.funds -= value;
      gameState.currentBet += value;
      updateFundsHUD();
      setClearBtnState(); 

      const newChip = document.createElement("div");
      newChip.className = "chip";
      newChip.dataset.value = value;
      newChip.style.width = `${chipSize}px`;
      newChip.style.height = `${chipSize}px`;
      newChip.style.position = "absolute";

      if (zone.classList.contains("tie-bet")) {
        const w = zone.offsetWidth, h = zone.offsetHeight;
        const Ax = 0.15 * w, Ay = h;
        const Bx = 0.5 * w, By = 0;
        const Cx = 0.85 * w, Cy = h;
        let u = Math.random(), v = Math.random();
        if (u + v > 1) { u = 1 - u; v = 1 - v; }
        const x = Ax + u * (Bx - Ax) + v * (Cx - Ax);
        const y = Ay + u * (By - Ay) + v * (Cy - Ay);
        newChip.style.left = `${x - chipSize / 2}px`;
        newChip.style.top = `${y - chipSize / 2}px`;
      } else {
        newChip.style.top = `${20 + Math.random() * 20}px`;
        newChip.style.left = `${50 + Math.random() * 40}px`;
      }

      newChip.style.backgroundImage = `url(${spriteSheetPath})`;
      newChip.style.backgroundPosition = chipPositions[value];
      newChip.style.backgroundSize = "150px 100px";
      newChip.style.backgroundRepeat = "no-repeat";
      newChip.style.backgroundColor = "transparent";
      zone.appendChild(newChip);
    });
  });

  // --- Clear Bet Button Logic ---
  const clearBtn = document.getElementById("clearBetBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (gameState.gamePhase !== "betting") {
        showError("Your fate has already been sealed. You cannot change your bets now.");
        setClearBtnState();
        return;
      }
      // Refund the current bet to funds
      gameState.funds += gameState.currentBet;
      // Reset bet zone tracking
      gameState.betAmounts.player = 0;
      gameState.betAmounts.tie = 0;
      gameState.betAmounts.banker = 0;
      gameState.selectedZone = null;
      gameState.currentBet = 0;
      updateFundsHUD();
      document.querySelectorAll(".bet-zone .chip").forEach(chip => chip.remove());
      setClearBtnState(); 
    });
  }
}

export function setClearBtnState() {
  const clearBtn = document.getElementById('clearBetBtn');
  const dealBtn = document.getElementById('dealBtn');
  const hasBet = Object.values(gameState.betAmounts).some(amount => amount > 0);

  if (clearBtn) clearBtn.disabled = !hasBet || gameState.gamePhase !== "betting";
  if (dealBtn) dealBtn.disabled = !hasBet || gameState.gamePhase !== "betting";
}