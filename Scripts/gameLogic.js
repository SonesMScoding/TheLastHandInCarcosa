

export function calculatePoints(hand) {
  let total = 0;
  for (const card of hand) {
    if (!card || !card.value) continue;
    let add = 0;
    switch (card.value) {
      case 'A':
        add = 0; // Ace is 0 in baccarat
        break;
      case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
        add = parseInt(card.value);
        break;
      case '10': case 'J': case 'Q': case 'K':
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

export function shouldDrawThirdCard(hand, isPlayer, playerThirdCard = null) {
  const total = calculatePoints(hand);

  if (isPlayer) return total <= 5;

  if (total >= 7) return false;
  if (playerThirdCard === null) return total <= 5;

  let playerValue = playerThirdCard.value;
  if (playerValue === 'A') playerValue = 0; // Ace is 0 in baccarat
  else if (['J', 'Q', 'K'].includes(playerValue)) playerValue = 0;
  else playerValue = parseInt(playerValue);

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