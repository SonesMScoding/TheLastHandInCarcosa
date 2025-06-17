/* ==========================================
   deck.js
   Creates and manages the deck of cards for baccarat
   Handles shuffling, drawing cards, and reshuffling
   ========================================== */

import { gameState } from './game-state.js';
import { updateShoeView } from './ui-utils.js';

// Standard 52-card deck for baccarat (no jokers)
export function createDeck() {
  const suitMap = {
    hearts: 'hearts',
    diamonds: 'dia',
    clubs: 'club',
    spades: 'spades'
  };
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  for (const suit of suits) {
    const prefix = suitMap[suit];
    for (const value of values) {
      let name = prefix + (
        value === 'A' ? 'a' :
        value === 'J' ? 'j' :
        value === 'Q' ? 'q' :
        value === 'K' ? 'k' : value
      );
      deck.push({ suit: prefix, value, name });
    }
  }
  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck() {
  let deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  gameState.deck = deck;
  gameState.discard = [];
  gameState.reshuffles++;
  updateShoeView();
}

// Draw a card from the deck
export function drawCard() {
  if (!gameState.deck || gameState.deck.length === 0) {
    shuffleDeck();
  }
  const card = gameState.deck.shift();
  if (!gameState.discard) gameState.discard = [];
  if (card) gameState.discard.push(card);
  updateShoeView();
  return card;
}

// Show reshuffle popup and reshuffle deck
export function showReshufflePopup(callback) {
  const popup = document.getElementById('reshuffle-popup');
  if (popup) {
    popup.classList.add('active');
    const content = popup.querySelector('.popup-content');
    if (content) content.textContent = "Reshuffling the deck...";
  }
  setTimeout(() => {
    if (popup) popup.classList.remove('active');
    if (typeof callback === 'function') callback();
  }, 2000);
}