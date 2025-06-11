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