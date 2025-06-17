/* ==========================================
   chips.js
   Handles chip sprite setup and initialization for Baccarat
   ========================================== */

export function setupChips(chipSize, spriteSheetPath, chipPositions) {
  document.querySelectorAll(".chip").forEach(chip => {
    const value = chip.dataset.value;
    chip.style.width = `${chipSize}px`;
    chip.style.height = `${chipSize}px`;
    chip.style.backgroundImage = `url(${spriteSheetPath})`;
    if (chipPositions[value]) {
      chip.style.backgroundPosition = chipPositions[value];
    } else {
      chip.style.backgroundPosition = "0px 0px";
      console.warn("Unknown chip value for sprite:", value);
    }
    chip.style.backgroundSize = "150px 100px";
    chip.style.backgroundRepeat = "no-repeat";
    chip.style.backgroundColor = "transparent";
    chip.addEventListener("dragstart", e => {
      e.dataTransfer.setData("chipValue", value);
    });
  });
}

// Easy initialization with defaults
export function initializeChips() {
  const chipPositions = {
    "1": "0px 0px",
    "5": "-50px -50px",
    "10": "-50px 0px",
    "25": "0px -50px",
    "100": "-100px 0px"
  };
  const spriteSheetPath = "./sprite/chips/chips.png";
  const chipSize = 50;
  setupChips(chipSize, spriteSheetPath, chipPositions);
}