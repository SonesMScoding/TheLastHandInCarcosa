/* ==========================================
   dealing.js
   Handles dealing cards, third card logic, and card animations for Baccarat
   ========================================== */

import { createCardElement } from "./cards.js";
import { gameState } from './game-state.js';
import { showError } from './ui-utils.js';
import { setClearBtnState } from './betting-chips.js';
import { shouldDrawThirdCard } from './game-logic.js';
import { drawCard } from './deck.js';
import { cloneDeep } from './utils.js';

const spritePath = "./sprite/cards/cards.png";

// https://dev.to/mugas/flip-cards-with-javascript-2ad0
// Helper: Create a flippable card DOM structure
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
  back.style.backgroundImage = "url('./sprite/cards/card-back.png')";
  back.style.backgroundSize = "cover";
  back.style.backgroundPosition = "center";

  inner.appendChild(front);
  inner.appendChild(back);
  wrapper.appendChild(inner);

  return wrapper;
}

// https://www.w3schools.com/js/js_async.asp
// Main: Deal cards, animate, and update scores
export async function dealCards() {
  setClearBtnState();

  // --- Reset score colors at the start of each deal ---
  const playerScoreElem = document.getElementById('playerScore');
  const bankerScoreElem = document.getElementById('bankerScore');
  if (playerScoreElem) playerScoreElem.style.color = "";
  if (bankerScoreElem) bankerScoreElem.style.color = "";

  if (gameState.currentBet === 0) {
    showError("You've placed no bets... the yellow king is displeased");
    return;
  }
  if (gameState.gamePhase !== "betting") {
    showError("You can't deal right now!");
    return;
  }
  // https://www.w3schools.com/jsref/prop_pushbutton_disabled.asp

  gameState.gamePhase = 'dealing';
  const dealBtn = document.getElementById('dealBtn');
  if (dealBtn) dealBtn.disabled = true;

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
    if (!pCard || !bCard) return; 
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

  // Debug: log the hand to verify card objects
  console.log("Player Hand:", gameState.playerHand);
  console.log("Banker Hand:", gameState.bankerHand);

  // https://doc.babylonjs.com/features/featuresDeepDive/animation/sequenceAnimations/
  // Animation: deal and flip cards one by one, updating score as you go
  const sequence = [
    { handElem: playerHandElem, card: playerCards[0], hand: 'player' },
    { handElem: bankerHandElem, card: bankerCards[0], hand: 'banker' },
    { handElem: playerHandElem, card: playerCards[1], hand: 'player' },
    { handElem: bankerHandElem, card: bankerCards[1], hand: 'banker' }
  ];
  if (playerCards[2]) sequence.push({ handElem: playerHandElem, card: playerCards[2], hand: 'player' });
  if (bankerCards[2]) sequence.push({ handElem: bankerHandElem, card: bankerCards[2], hand: 'banker' });

  // Reset scores to zero before dealing
  playerScoreElem.textContent = 'P:0';
  bankerScoreElem.textContent = 'B:0';

  let playerSum = 0;
  let bankerSum = 0;

  // Ensures that the cards are being dealt and added to scores
  //one by one with a delay for animation
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
      playerScoreElem.textContent = `P:${playerSum % 10}`;
    } else {
      bankerSum += (step.card.value === 'A' || ['J','Q','K','10'].includes(step.card.value)) ? 0 : parseInt(step.card.value) || 0;
      bankerScoreElem.textContent = `B:${bankerSum % 10}`;
    }
  }

  // --- Cthulhu's Boon: Show banker score reduction if active ---
  let originalBankerPoints = bankerSum % 10;
  let diamondReduction = 0;
  let adjustedBankerPoints = originalBankerPoints;
  if (
    gameState.activeBoons &&
    gameState.activeBoons.includes('cthulusboon')
  ) {
    diamondReduction = gameState.bankerHand.filter(
      card => card.suit === "dia" || card.suit === "diamonds"
    ).length;
    if (diamondReduction > 0) {
      adjustedBankerPoints = (originalBankerPoints - diamondReduction + 10) % 10;
      bankerScoreElem.innerHTML = `B:${originalBankerPoints} <span style="color:deepskyblue;">- ${diamondReduction} = ${adjustedBankerPoints}</span>`;
    } else {
      bankerScoreElem.textContent = `B:${originalBankerPoints}`;
    }
  } else {
    bankerScoreElem.textContent = `B:${originalBankerPoints}`;
  }

  // https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
  //ngl, the deep clone was not an original idea, and I had the help of AI to implement it
 
  // Before dealing cards, save a snapshot
  //(mostly for the repaired reputation item)
  gameState._preRoundSnapshot = {
    funds: gameState.funds,
    totalPayouts: gameState.totalPayouts,
    totalLosses: gameState.totalLosses,
    playerWinStreak: gameState.playerWinStreak,
    hasWonByOnePoint: gameState.hasWonByOnePoint,
    lastWinner: gameState.lastWinner,
    lastLossAmount: gameState.lastLossAmount,
    boonUnlocks: cloneDeep(gameState.boonUnlocks),
    itemUnlocks: cloneDeep(gameState.itemUnlocks),
    usedItems: [...gameState.usedItems],
    betAmounts: { ...gameState.betAmounts },
    ledgerHTML: document.getElementById('ledger-body')?.innerHTML,
    ledgerHTMLAlt: document.getElementById('ledger-body-alt')?.innerHTML,
    playerWinCount: document.getElementById('playerWin-count')?.textContent,
    bankerWinCount: document.getElementById('bankerWin-count')?.textContent,
    tieCount: document.getElementById('tie-count')?.textContent,
    playerWinCountAlt: document.getElementById('playerWin-count-alt')?.textContent,
    bankerWinCountAlt: document.getElementById('bankerWin-count-alt')?.textContent,
    tieCountAlt: document.getElementById('tie-count-alt')?.textContent,
    // Add any other state you want to revert
  };
}