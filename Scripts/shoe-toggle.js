/* ==========================================
   shoe-toggle.js
   Overlay for showing the shoe (remaining cards)
   ========================================== */

import { cardMap, cardSpritePositions } from './cards.js';
import { gameState } from './game-state.js';

// ========== Constants & Config ==========
const SPRITE_WIDTH = 283;
const SPRITE_HEIGHT = 340;
const SPRITE_SHEET_WIDTH = 2264;
const SPRITE_SHEET_HEIGHT = 2380;
const CARD_WIDTH = 50;
const CARD_HEIGHT = 60;
const SPRITE_PATH = "./sprite/cards/cards.png";

const suits = [
  { prefix: "spades", symbol: "♠", cards: [] },
  { prefix: "hearts", symbol: "♥", cards: [] },
  { prefix: "dia", symbol: "♦", cards: [] },
  { prefix: "club", symbol: "♣", cards: [] }
];

// Fill each suit's row in sprite order
cardMap.forEach(card => {
  for (const suit of suits) {
    if (card.startsWith(suit.prefix)) {
      suit.cards.push(card);
      break;
    }
  }
});

//https://www.w3schools.com/jsref/event_target.asp

// ========== Main Overlay Setup ==========
export function setupShoeOverlay() {
  const shoe = document.getElementById("shoe-id");
  const shoeView = document.getElementById("shoe-view");
  if (!shoe || !shoeView) return;

  shoe.style.cursor = "pointer";
  shoe.addEventListener("click", () => {
    const isOpen = shoeView.classList.toggle("active");
    shoeView.style.display = isOpen ? "flex" : "none";
    
    if (isOpen) {
      shoeView.innerHTML = "";

      suits.forEach(({ symbol, cards }) => {
        const row = document.createElement("div");
        row.className = "shoe-suit-row";
        const label = document.createElement("span");
        label.textContent = symbol;
        label.style.width = "24px";
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.justifyContent = "center";
        label.style.fontWeight = "bold";
        label.style.fontSize = "22px";
        row.appendChild(label);

        cards.forEach(cardName => {
          const cardDiv = document.createElement("div");
          cardDiv.className = "shoe-card";
          cardDiv.style.width = `${CARD_WIDTH}px`;
          cardDiv.style.height = `${CARD_HEIGHT}px`;
          const scale = CARD_HEIGHT / SPRITE_HEIGHT;
          cardDiv.style.backgroundImage = `url(${SPRITE_PATH})`;
          cardDiv.style.backgroundRepeat = "no-repeat";
          cardDiv.style.backgroundSize = `${SPRITE_SHEET_WIDTH * scale}px ${SPRITE_SHEET_HEIGHT * scale}px`;
          const pos = cardSpritePositions[cardName];
          cardDiv.style.backgroundPosition = `-${pos.x * scale}px -${pos.y * scale}px`;
          cardDiv.style.margin = "2px";
          cardDiv.style.borderRadius = "4px";
          cardDiv.style.boxShadow = "none";
          cardDiv.style.border = "1px solid #aaa";
          cardDiv.style.display = "inline-block";
          if (gameState.discard.some(card => card.name === cardName)) {
            cardDiv.style.opacity = "0.4";
            cardDiv.style.filter = "grayscale(1)";
          }
          row.appendChild(cardDiv);
        });
        shoeView.appendChild(row);
      });
    }
  });

  shoeView.addEventListener("click", (e) => {
    if (e.target === shoeView) {
      shoeView.classList.remove("active");
      shoeView.style.display = "none";
    }
  });
}