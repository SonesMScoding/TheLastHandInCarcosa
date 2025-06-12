export function setupChips(chipSize, spriteSheetPath, chipPositions) {
  document.querySelectorAll(".chip").forEach(chip => {
    const value = chip.dataset.value;
    chip.style.width = `${chipSize}px`;
    chip.style.height = `${chipSize}px`;
    chip.style.backgroundImage = `url(${spriteSheetPath})`;
    chip.style.backgroundPosition = chipPositions[value];
    chip.style.backgroundSize = "150px 100px";
    chip.style.backgroundRepeat = "no-repeat";
    chip.style.backgroundColor = "transparent";
    chip.addEventListener("dragstart", e => {
      e.dataTransfer.setData("chipValue", value);
    });
  });
}

// Add this function for easy initialization with defaults
export function initializeChips() {
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
}