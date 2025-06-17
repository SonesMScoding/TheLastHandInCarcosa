// cards.js
// Card mapping, parsing, and sprite position helpers for Baccarat
//

// --- Card Map (all possible card names) ---
export const cardMap = [
  "club10", "club2", "club3", "club4", "club5", "club6", "club7", "club8",
  "club9", "cluba", "clubj", "clubk", "clubq",
  "dia10", "dia2", "dia3", "dia4", "dia5", "dia6", "dia7", "dia8", "dia9", "diaa", "diaj", "diak", "diaq",
  "hearts10", "hearts2", "hearts3", "hearts4", "hearts5", "hearts6", "hearts7", "hearts8", "hearts9", "heartsa", "heartsj", "heartsk", "heartsq",
  "spades10", "spades2", "spades3", "spades4", "spades5", "spades6", "spades7", "spades8", "spades9", "spadesa", "spadesj", "spadesk", "spadesq"
];

// --- Card Parsing ---
// Convert "club3" => { suit: "club", value: "3", name: "club3" }
export function parseCard(cardName) {
  const match = cardName.match(/^(club|dia|hearts|spades)(10|[2-9]|[ajqk])$/i);
  if (!match) return null;
  let value = match[2];
  if (["a", "j", "q", "k"].includes(value)) value = value.toUpperCase();
  return {
    suit: match[1],
    value: value,
    name: cardName
  };
}

// --- Card Sprite Positions ---
export const cardSpritePositions = {};
const SPRITE_WIDTH = 283;
const SPRITE_HEIGHT = 340;
const SPRITE_COLS = 8;
const SPRITE_SHEET_WIDTH = 2264;
const SPRITE_SHEET_HEIGHT = 2380;

cardMap.forEach((fileName, i) => {
  const row = Math.floor(i / SPRITE_COLS);
  const col = i % SPRITE_COLS;
  cardSpritePositions[fileName] = {
    x: col * SPRITE_WIDTH,
    y: row * SPRITE_HEIGHT
  };
});

// --- Card Element Creation ---
export function createCardElement(cardObj, spritePath) {
  // Accepts either a string or an object
  const cardName = typeof cardObj === "string" ? cardObj : (cardObj && cardObj.name);
  const CARD_WIDTH = 100;
  const CARD_HEIGHT = 120;
  const scale = CARD_HEIGHT / SPRITE_HEIGHT;
  const card = document.createElement("div");
  card.className = "card";
  card.style.width = `${CARD_WIDTH}px`;
  card.style.height = `${CARD_HEIGHT}px`;
  card.style.backgroundImage = `url(${spritePath})`;
  card.style.backgroundRepeat = "no-repeat";
  card.style.backgroundSize = `${SPRITE_SHEET_WIDTH * scale}px ${SPRITE_SHEET_HEIGHT * scale}px`;

  const pos = cardSpritePositions[cardName];
  if (pos) {
    card.style.backgroundPosition = `-${pos.x * scale}px -${pos.y * scale}px`;
  } else {
    // fallback: blank or error card
    console.warn("Unknown or malformed card for sprite:", cardObj);
    card.style.backgroundPosition = "0 0";
    card.style.backgroundColor = "#900";
    card.textContent = "?";
  }
  return card;
}