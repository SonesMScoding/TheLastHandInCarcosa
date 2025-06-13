/* ==========================================
   game-logic.js
   Baccarat hand calculation and third card rules
   [Add your informational notes here.]
   ========================================== */

export function calculatePoints(hand) {
  let total = 0;
  for (const card of hand) {
    if (!card || !card.value) continue;
    let add = 0;
    switch (card.value) {
      case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
        add = parseInt(card.value);
        break;
      case '10': case 'J': case 'Q': case 'K': case 'A':
        add = 0;
        break;
      default:
        add = 0;
        break;
    }
    console.log(`Card: ${card.value}, Added: ${add}`);
    total += add;
  }
  console.log("Hand:", hand.map(c => c.value), "Total:", total % 10);
  return total % 10;
}

/** https://jsdoc.app/tags-param
 * Determines if a third card should be drawn for player or banker.
 * @param {Array} hand - The hand to evaluate.
 * @param {boolean} isPlayer - True if evaluating for player, false for banker.
 * @param {Object|null} playerThirdCard - The player's third card (for banker logic).
 * @returns {boolean}
 */
export function shouldDrawThirdCard(hand, isPlayer, playerThirdCard = null) {
  const total = calculatePoints(hand);

  if (isPlayer) return total <= 5;

  if (total >= 7) return false;
  if (playerThirdCard === null) return total <= 5;

  let playerValue = playerThirdCard.value;
  if (['J', 'Q', 'K', 'A'].includes(playerValue)) playerValue = 0;
  else playerValue = parseInt(playerValue);


  //Follows Casino Royale rules for third card drawing
  // https://en.wikipedia.org/wiki/Baccarat#Third_card_rules
  switch (total) {
    case 0:
    case 1:
    case 2: return true;
    case 3: return playerValue !== 8;
    case 4: return playerValue >= 2 && playerValue <= 7;
    case 5: return playerValue >= 4 && playerValue <= 7;
    case 6: return playerValue === 6 || playerValue === 7;
    default: return false;
  }
}