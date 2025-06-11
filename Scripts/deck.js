import { cardMap, parseCard } from "./cardMapping.js";
import { gameState } from './gameState.js';

// Fisher-Yates shuffle
export function shuffleDeck() {
  // Convert all card names to card objects
  gameState.deck = cardMap.map(parseCard);
  for (let i = gameState.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
  }
  gameState.discard = [];
}