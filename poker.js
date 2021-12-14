const fs = require('fs');

// Imports hands from txt file

const hands = fs.readFileSync('./poker-hands.txt').toString().split('\n');
let p1Score = 0;
let p2Score = 0;

// Assign a rank to each combination - higher numbers correspond to stronger combinations

const handsRanking = {
  highCard: 1,
  pair: 2,
  twoPairs: 3,
  threeOfaKind: 4,
  straight: 5,
  flush: 6,
  fullHouse: 7,
  fourOfaKind: 8,
  straightFlush: 9,
  royalFlush: 10,
};

const faceCardsRanking = {
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const straightCheck = '23456789TJQKA';

const {
  highCard,
  pair,
  twoPairs,
  threeOfaKind,
  straight,
  flush,
  fullHouse,
  fourOfaKind,
  straightFlush,
  royalFlush,
} = handsRanking;

// Assigns a numerical score to a hand based on cards combination.
// Hands are broken down into ranks and suits, and ranks are put is ascending order.

function handStrength(ranks, suits) {
  if (isRoyalFlush(ranks, suits)) {
    return royalFlush;
  }
  if (isStraightFlush(ranks, suits)) {
    return straightFlush;
  }
  if (isFourOfaKind(ranks)) {
    return fourOfaKind;
  }
  if (isFullHouse(ranks)) {
    return fullHouse;
  }
  if (areAllSameSuit(suits)) {
    return flush;
  }
  if (isStraight(ranks)) {
    return straight;
  }
  if (isThreeOfaKind(ranks)) {
    return threeOfaKind;
  }
  if (isTwoPairs(ranks)) {
    return twoPairs;
  }
  if (isPair(ranks)) {
    return pair;
  }
  return highCard;
}

// Sorts player's cards by rank in ascending order

function orderByRank(cardOne, cardTwo) {
  if (/[2-9]/.test(cardOne) && /[2-9]/.test(cardTwo)) {
    return Number(cardOne) - Number(cardTwo);
  }
  if (
    Object.keys(faceCardsRanking).includes(cardOne) &&
    Object.keys(faceCardsRanking).includes(cardTwo)
  ) {
    return faceCardsRanking[cardOne] - faceCardsRanking[cardTwo];
  }

  cardOne = Object.keys(faceCardsRanking).includes(cardOne)
    ? faceCardsRanking[cardOne]
    : Number(cardOne);

  cardTwo = Object.keys(faceCardsRanking).includes(cardTwo)
    ? faceCardsRanking[cardTwo]
    : Number(cardTwo);

  return cardOne - cardTwo;
}

// The functions below determine the strength of a hand based its cards combination

function isTenToAce(handRanks) {
  return handRanks.every((cardRank) => {
    return Object.keys(faceCardsRanking).includes(cardRank);
  });
}

function isRoyalFlush(ranks, suits) {
  return areAllSameSuit(suits) && isTenToAce(ranks);
}

function isStraightFlush(ranks, suits) {
  return areAllSameSuit(suits) && isStraight(ranks);
}

function isFourOfaKind(ranks) {
  return ranks[0] === ranks[3] || ranks[1] === ranks[4];
}

function isFullHouse(ranks) {
  return (
    ranks[0] === ranks[1] &&
    ranks[3] === ranks[4] &&
    (ranks[2] === ranks[0] || ranks[2] === ranks[4])
  );
}

function areAllSameSuit(suits) {
  return suits.every((suit) => suit === suits[0]);
}

function isStraight(ranks) {
  return straightCheck.includes(ranks.sort(orderByRank).join(''));
}

function isThreeOfaKind(ranks) {
  return ranks[0] === ranks[2] || ranks[2] === ranks[4];
}

function isTwoPairs(ranks) {
  return (
    (ranks[1] === ranks[0] || ranks[1] === ranks[2]) &&
    (ranks[3] === ranks[2] || ranks[3] === ranks[4])
  );
}

function isPair(ranks) {
  return (
    ranks[0] === ranks[1] ||
    ranks[1] === ranks[2] ||
    ranks[2] === ranks[3] ||
    ranks[3] === ranks[4]
  );
}

// Evaluates played hand in each line in poker-hands.txt

hands.forEach((hand) => {
  const p1Suits = hand.slice(0, 14).match(/[CDHS]/g);
  const p1Ranks = hand
    .slice(0, 14)
    .match(/[2-9]|[TJQKA]/g)
    .sort(orderByRank);
  const p2Suits = hand.slice(15).match(/[CDHS]/g);
  const p2Ranks = hand
    .slice(15)
    .match(/[2-9]|[TJQKA]/g)
    .sort(orderByRank);

  const p1HandStrength = handStrength(p1Ranks, p1Suits);
  const p2HandStrength = handStrength(p2Ranks, p2Suits);

  if (p1HandStrength > p2HandStrength) return p1Score++;
  if (p2HandStrength > p1HandStrength) return p2Score++;
  
  // Determines which players' cards to use for tie-breaks based on the hands they have

  if ([1, 5, 6, 9, 10].includes(p1HandStrength)) {
    for (let i = p1Ranks.length; i > 0; i--) {
      if (p1Ranks[i] !== p2Ranks[i]) {
        return p1Ranks[i] > p2Ranks[i] ? p1Score++ : p2Score++;
      }
    }
  }

  if ([4, 7, 8].includes(p1HandStrength)) {
    return p1Ranks[2] > p2Ranks[2] ? p1Score++ : p2Score++;
  }
  
  // Tie-break for two pairs
  // If both players' two pairs are the same, their remaining cards are compared 

  if (p1HandStrength === 3) {
    const p1Highest = p1Ranks[1] > p1Ranks[3] ? p1Ranks[1] : p1Ranks[3];
    const p1Lowest = p1Highest === p1Ranks[1] ? p1Ranks[3] : p1Ranks[1];
    const p2Highest = p2Ranks[1] > p2Ranks[3] ? p2Ranks[1] : p2Ranks[3];
    const p2Lowest = p2Highest === p2Ranks[1] ? p2Ranks[3] : p2Ranks[1];

    if (p1Highest === p2Highest && p1Lowest === p2Lowest) {
      const p1Kicker = p1Ranks.filter((card) => {
        return card !== p1Highest && card !== p1Lowest;
      });
      const p2Kicker = p2Ranks.filter((card) => {
        return card !== p2Highest && card !== p2Lowest;
      });
      return p1Kicker[0] > p2Kicker[0] ? p1Score++ : p2Score++;
    }

    if (p1Highest === p2Highest) {
      return p1Lowest > p2Lowest ? p1Score++ : p2Score++;
    }

    return p1Highest > p2Highest ? p1Score++ : p2Score++;
  }
  
  // Tie-break for pair
  // If players have the same pair, their highest rank remaining cards are compared
  // If the remaining cards are the same, their second highest rank card is compared and so on

  if (p1HandStrength === 2) {
    let p1Pair, p2Pair;
    for (let i = 0; i < p1Ranks.length; i++) {
      if (p1Ranks[i] === p1Ranks[i + 1]) {
        p1Pair = p1Ranks[i];
        {
          break;
        }
      }
    }
    for (let i = 0; i < p2Ranks.length; i++) {
      if (p2Ranks[i] === p2Ranks[i + 1]) {
        p2Pair = p2Ranks[i];
        {
          break;
        }
      }
    }
    if (p1Pair === p2Pair) {
      let p1RemainingCards = p1Ranks.filter((card) => {
        return card !== p1Pair;
      });
      let p2RemainingCards = p2Ranks.filter((card) => {
        return card !== p2Pair;
      });
      for (let i = p1RemainingCards.length; i > 0; i--) {
        if (p1RemainingCards[i] !== p2RemainingCards[i]) {
          return p1RemainingCards[i] > p2RemainingCards[i]
            ? p1Score++
            : p2Score++;
        }
      }
    }
    return p1Pair > p2Pair ? p1Score++ : p2Score++;
  }
});

console.log(`Player 1: ${p1Score}
Player 2: ${p2Score}`);
