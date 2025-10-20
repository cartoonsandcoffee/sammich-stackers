// Pure game logic functions - no React, no side effects
import { CARD_DATABASE } from './cardData';

export const shuffle = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateScores = (sandwich, permanentBreadBonus = 0) => {
  let flavor = 0;
  let yuck = 0;
  let cash = 0;
  let yuckCancelers = 0;
  let breadBonus = permanentBreadBonus;

  // First pass: count yuck cancelers and sardines
  sandwich.forEach(card => {
    if (card.name === 'Cold Turkey' || card.name === 'Tar tar sauce') {
      yuckCancelers++;
    }
    if (card.name === 'Salty Sardines') {
      breadBonus++;
    }
  });

  // Second pass: calculate flavor, yuck, cash for each card
  sandwich.forEach((card, index) => {
    const cardData = CARD_DATABASE[card.name];
    let cardFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
    let cardYuck = cardData.yuck;
    
    // Bread gets sardines bonus
    if (card.name === 'Bread') {
      cardFlavor += breadBonus;
    }
    
    // Card-specific abilities
    switch (card.name) {
      case 'Tar tar sauce':
        const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
        cardFlavor += fishCount;
        break;
        
      case 'Beefy Balogna':
        const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== index).length;
        cardFlavor += otherBaloneys;
        break;
        
      case 'Ham':
        const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
        cardFlavor += cheeseCount * 2;
        break;
        
      case 'Mayonaise':
        const prevCard = index > 0 ? sandwich[index - 1] : null;
        const nextCard = index < sandwich.length - 1 ? sandwich[index + 1] : null;
        if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
          cardFlavor += 20;
        }
        break;
        
      case 'Lean Beef':
        const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= index).length;
        cardFlavor = cardFlavor * Math.pow(2, leanBeefCount - 1);
        break;
        
      case 'Jelly':
        const prevCardJelly = index > 0 ? sandwich[index - 1] : null;
        const nextCardJelly = index < sandwich.length - 1 ? sandwich[index + 1] : null;
        if ((prevCardJelly && prevCardJelly.name === 'Peanut Butter') || (nextCardJelly && nextCardJelly.name === 'Peanut Butter')) {
          cardFlavor += 2;
        }
        break;
    }
    
    flavor += cardFlavor;
    yuck += cardYuck;
    cash += cardData.cash;
  });

  // Apply yuck cancelers
  yuck = Math.max(0, yuck - yuckCancelers);
  
  // Pickles quadratic bonus (after yuck cancellation)
  sandwich.forEach(card => {
    if (card.name === 'Pickles') {
      const picklesBonus = yuck * yuck * 2;
      flavor += picklesBonus;
    }
  });

  return { flavor, yuck, cash, breadBonus };
};

export const playOpponentCard = (deck, sandwich, permanentBreadBonus, targetScore = 0, playerFinished = false) => {
  if (deck.length === 0) {
    return { action: 'finish', card: null };
  }
  
  const currentScores = calculateScores(sandwich, 0);
  
  let shouldStop = false;
  if (playerFinished) {
    if (targetScore === 0) {
      // Player busted, just get any points
      shouldStop = currentScores.flavor > 0;
    } else {
      // Try to beat player's score
      shouldStop = currentScores.flavor > targetScore || 
                   (currentScores.yuck >= 2 && currentScores.flavor >= targetScore - 2);
    }
  } else {
    // Conservative play while player is still going
    shouldStop = currentScores.flavor >= 8 || (currentScores.yuck >= 1 && Math.random() > 0.5);
  }
  
  if (shouldStop) {
    return { action: 'finish', card: null };
  }
  
  return { action: 'draw', card: deck[0] };
};

export const generateBotDeck = (matchNumber) => {
  let deckNames = [
    'Bread', 'Bread',
    'Cream Cheese', 'Cream Cheese', 'Cream Cheese', 'Cream Cheese',
    'Jelly', 'Jelly', 'Jelly', 'Jelly',
    'Bananas', 'Bananas'
  ];
  
  if (matchNumber >= 2) deckNames.push('Jelly', 'Cold Turkey');
  if (matchNumber >= 3) deckNames.push('Bananas', 'American Cheeze');
  if (matchNumber >= 4) deckNames.push('Cheddar Slices', 'Ham');
  if (matchNumber >= 6) deckNames.push('Pickles', 'Lean Beef');
  
  return deckNames;
};