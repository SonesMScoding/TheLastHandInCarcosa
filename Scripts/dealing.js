import { createCardElement } from "./cardMapping.js";
import { gameState } from './gameState.js';
import { showError, revealScoresByCard } from './uiScript.js';
import { setClearBtnState } from './bettingChips.js';
import { calculatePoints, shouldDrawThirdCard } from './gameLogic.js';
import { drawCard } from './deck.js';

const spritePath = "./sprite/cards/cardSpritesheet.png";

// Helper to create a flippable card DOM structure
function createFlippableCard(cardObj) {
  const wrapper = document.createElement("div");
  wrapper.className = "card card-wrapper";

  const inner = document.createElement("div");
  inner.className = "card-inner";

  // Card front (face)
  const front = createCardElement(cardObj, spritePath);
  front.classList.add("card-front");

  // Card back
  const back = document.createElement("div");
  back.className = "card-back";
  back.style.backgroundImage = "url('./sprite/cards/cardBack.png')";
  back.style.backgroundSize = "cover";
  back.style.backgroundPosition = "center";

  inner.appendChild(front);
  inner.appendChild(back);
  wrapper.appendChild(inner);

  return wrapper;
}

export async function dealCards() {
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

  // Animation: deal and flip cards one by one, updating score as you go
  const sequence = [
    { handElem: playerHandElem, card: playerCards[0], hand: 'player' },
    { handElem: bankerHandElem, card: bankerCards[0], hand: 'banker' },
    { handElem: playerHandElem, card: playerCards[1], hand: 'player' },
    { handElem: bankerHandElem, card: bankerCards[1], hand: 'banker' }
  ];
  // Add third cards to sequence if present
  if (playerCards[2]) sequence.push({ handElem: playerHandElem, card: playerCards[2], hand: 'player' });
  if (bankerCards[2]) sequence.push({ handElem: bankerHandElem, card: bankerCards[2], hand: 'banker' });

  // Reset scores to zero before dealing
  document.getElementById('playerScore').textContent = 'P:0';
  document.getElementById('bankerScore').textContent = 'B:0';

  let playerSum = 0;
  let bankerSum = 0;

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    await new Promise(res => setTimeout(res, 500));
    const cardWrapper = createFlippableCard(step.card);
    cardWrapper.style.top = "0";
    cardWrapper.style.bottom = "";
    cardWrapper.style.transform = "";
    step.handElem.appendChild(cardWrapper);

    // Flip after a short delay for animation
    setTimeout(() => {
      cardWrapper.classList.add("flipped");
    }, 200);

    // Update score as each card is dealt
    if (step.hand === 'player') {
      playerSum += (step.card.value === 'A' || ['J','Q','K','10'].includes(step.card.value)) ? 0 : parseInt(step.card.value) || 0;
      document.getElementById('playerScore').textContent = `P:${playerSum % 10}`;
    } else {
      bankerSum += (step.card.value === 'A' || ['J','Q','K','10'].includes(step.card.value)) ? 0 : parseInt(step.card.value) || 0;
      document.getElementById('bankerScore').textContent = `B:${bankerSum % 10}`;
    }
  }

  // Enable "End Round" button or other UI as needed here
}