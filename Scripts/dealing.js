import { createCardElement } from "./cardMapping.js";
import { gameState } from './gameState.js';
import { showError } from './uiScript.js';
import { setClearBtnState } from './bettingChips.js';
import { calculatePoints, shouldDrawThirdCard } from './gameLogic.js';

const spritePath = "./sprite/cards/cardSpritesheet.png";

// Draw a card from the deck (returns a card object)
function drawCard() {
  if (gameState.deck.length <= 6) {
    showError("Not enough cards in the shoe. Please reshuffle.");
    return null;
  }
  const card = gameState.deck.pop();
  gameState.discard.push(card);
  return card;
}

// Flip animation helper
function flipCard(cardElement, cardObj) {
  setTimeout(() => {
    console.log("Flipping card:", cardObj);
    const front = createCardElement(cardObj, spritePath);
    cardElement.replaceWith(front);
  }, 300);
}

export function dealCards() {
  setClearBtnState();

  if (gameState.currentBet === 0) {
    showError("You've placed no bets... the yellow king is displeased");
    return;
  }
  if (gameState.gamePhase !== "betting") {
    showError("You can't deal right now!");
    return;
  }
  gameState.gamePhase = 'dealing';
  const dealBtn = document.getElementById('dealBtn');
  if (dealBtn) dealBtn.disabled = true;

  setClearBtnState();

  const playerHandElem = document.querySelector(".player-hand");
  const bankerHandElem = document.querySelector(".banker-hand");
  if (!playerHandElem || !bankerHandElem) return;

  // Clear previous cards
  playerHandElem.innerHTML = "";
  bankerHandElem.innerHTML = "";

  // Deal initial hands (card objects)
  const playerCards = [];
  const bankerCards = [];
  for (let i = 0; i < 2; i++) {
    const pCard = drawCard();
    const bCard = drawCard();
    if (!pCard || !bCard) return; // abort if deck is low
    playerCards.push(pCard);
    bankerCards.push(bCard);
  }

  // Draw third card for player if needed
  let playerThirdCard = null;
  if (shouldDrawThirdCard(playerCards, true)) {
    playerThirdCard = drawCard();
    if (!playerThirdCard) return;
    playerCards.push(playerThirdCard);
  }

  // Draw third card for banker if needed
  if (shouldDrawThirdCard(bankerCards, false, playerThirdCard)) {
    const bThird = drawCard();
    if (!bThird) return;
    bankerCards.push(bThird);
  }

  // Save dealt hands to gameState so endRound can access them
  gameState.playerHand = playerCards;
  gameState.bankerHand = bankerCards;

  console.log("Player hand objects:", playerCards);
  console.log("Banker hand objects:", bankerCards);

  // Calculate points
  const playerPoints = calculatePoints(playerCards);
  const bankerPoints = calculatePoints(bankerCards);

  // Update DOM
  document.getElementById('playerScore').textContent = `P:${playerPoints}`;
  document.getElementById('bankerScore').textContent = `B:${bankerPoints}`;

  // Animation: deal cards with flip
  const sequence = [
    { handElem: playerHandElem, card: playerCards[0] },
    { handElem: bankerHandElem, card: bankerCards[0] },
    { handElem: playerHandElem, card: playerCards[1] },
    { handElem: bankerHandElem, card: bankerCards[1] }
  ];
  // Add third cards to sequence if present
  if (playerCards[2]) sequence.push({ handElem: playerHandElem, card: playerCards[2] });
  if (bankerCards[2]) sequence.push({ handElem: bankerHandElem, card: bankerCards[2] });

  sequence.forEach((step, i) => {
    setTimeout(() => {
      // Card back
      const back = document.createElement("div");
      back.className = "card";
      back.style.backgroundImage = "url('./sprite/cards/cardBack.png')";
      back.style.backgroundSize = "cover";
      back.style.backgroundPosition = "center";
      step.handElem.appendChild(back);

      // Flip to front
      flipCard(back, step.card);
    }, i * 500);
  });
}