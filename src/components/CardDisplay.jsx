import React from 'react';
import { CARD_DATABASE } from '../cardData';
import { calculateScores } from '../gameLogic';
import styles from '../styles';

export const CardDisplay = ({ card, sandwich, position, permanentBreadBonus = 0, showCalculatedFlavor = false }) => {
  const cardData = CARD_DATABASE[card.name];
  
  // Calculate actual flavor contribution for this card
  const getCalculatedFlavor = () => {
    if (!sandwich || position === undefined) return null;
    
    let calculatedFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
    
    // Bread bonus - should just add permanentBreadBonus (already includes sardines from past rounds)
    if (card.name === 'Bread') {
      calculatedFlavor += permanentBreadBonus;
    }
    
    // Tar tar sauce
    if (card.name === 'Tar tar sauce') {
      const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
      calculatedFlavor += fishCount;
    }
    
    // Beefy Balogna
    if (card.name === 'Beefy Balogna') {
      const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== position).length;
      calculatedFlavor += otherBaloneys;
    }
    
    // Ham
    if (card.name === 'Ham') {
      const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
      calculatedFlavor += cheeseCount * 2;
    }
    
    // Mayonaise
    if (card.name === 'Mayonaise') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
        calculatedFlavor += 20;
      }
    }
    
    // Lean Beef
    if (card.name === 'Lean Beef') {
      const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= position).length;
      const multiplier = Math.pow(2, leanBeefCount - 1);
      calculatedFlavor = calculatedFlavor * multiplier;
    }
    
    // Pickles - CORRECT: base 2 + (yuck² × 2)
    if (card.name === 'Pickles') {
      const scores = calculateScores(sandwich, permanentBreadBonus);
      const picklesBonus = scores.yuck * scores.yuck * 2;
      calculatedFlavor = 2 + picklesBonus;  // Base 2 + quadratic bonus
    }
    
    // Jelly
    if (card.name === 'Jelly') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Peanut Butter') || (nextCard && nextCard.name === 'Peanut Butter')) {
        calculatedFlavor += 2;
      }
    }
    
    return calculatedFlavor;
  };
  
  const calculatedFlavor = showCalculatedFlavor ? getCalculatedFlavor() : null;
  
  // Get list of cards providing bonuses to this card
  const getBonusSources = () => {
    if (!sandwich || position === undefined) return [];
    
    const sources = [];
    
    // Check for Spiced Ham before this card
    if (position > 0 && sandwich[position - 1].name === 'Spiced Ham') {
      sources.push('Spiced Ham');
    }
    
    // Bread gets bonus from Sardines
    if (card.name === 'Bread' && permanentBreadBonus > 0) {
      sources.push('Salty Sardines');
    }
    
    // Tar tar sauce gets bonus from Fish
    if (card.name === 'Tar tar sauce') {
      const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
      if (fishCount > 0) sources.push(`${fishCount} Fish`);
    }
    
    // Beefy Balogna from other baloneys
    if (card.name === 'Beefy Balogna') {
      const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== position).length;
      if (otherBaloneys > 0) sources.push(`${otherBaloneys} Other Balogna`);
    }
    
    // Ham from Cheese
    if (card.name === 'Ham') {
      const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
      if (cheeseCount > 0) sources.push(`${cheeseCount} Cheese`);
    }
    
    // Mayonaise from adjacent Bread
    if (card.name === 'Mayonaise') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
        sources.push('Adjacent Bread');
      }
    }
    
    // Lean Beef from other Lean Beef
    if (card.name === 'Lean Beef') {
      const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= position).length;
      if (leanBeefCount > 1) sources.push(`${leanBeefCount} Lean Beef Stack`);
    }
    
    // Pickles from Yuck
    if (card.name === 'Pickles') {
      const scores = calculateScores(sandwich, permanentBreadBonus);
      if (scores.yuck > 0) sources.push(`${scores.yuck} Yuck`);
    }
    
    // Jelly from Peanut Butter
    if (card.name === 'Jelly') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Peanut Butter') || (nextCard && nextCard.name === 'Peanut Butter')) {
        sources.push('Peanut Butter');
      }
    }
    
    return sources;
  };
  
  const bonusSources = getBonusSources();
  
  // Calculate what this card's flavor would be in current context (for tooltip)
  const getCardFlavorExplanation = () => {
    if (!sandwich || position === undefined) return null;
    
    const scores = calculateScores(sandwich, permanentBreadBonus);
    let baseFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
    let explanation = `Base: ${baseFlavor}`;
    
    // Bread bonus
    if (card.name === 'Bread') {
      const sardineCount = sandwich.filter(c => c.name === 'Salty Sardines').length;
      const totalBreadBonus = permanentBreadBonus + sardineCount;
      if (totalBreadBonus > 0) {
        explanation += ` + ${totalBreadBonus} (Sardines)`;
      }
    }
    
    // Tar tar sauce
    if (card.name === 'Tar tar sauce') {
      const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
      if (fishCount > 0) {
        explanation += ` + ${fishCount} (Fish)`;
      }
    }
    
    // Beefy Balogna
    if (card.name === 'Beefy Balogna') {
      const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== position).length;
      if (otherBaloneys > 0) {
        explanation += ` + ${otherBaloneys} (Other Baloney)`;
      }
    }
    
    // Ham
    if (card.name === 'Ham') {
      const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
      if (cheeseCount > 0) {
        explanation += ` + ${cheeseCount * 2} (${cheeseCount} Cheese)`;
      }
    }
    
    // Mayonaise
    if (card.name === 'Mayonaise') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
        explanation += ` + 20 (Next to Bread)`;
      }
    }
    
    // Lean Beef
    if (card.name === 'Lean Beef') {
      const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= position).length;
      const multiplier = Math.pow(2, leanBeefCount - 1);
      explanation += ` × ${multiplier} (${leanBeefCount} Beef)`;
    }
    
    // Pickles
    if (card.name === 'Pickles') {
      const picklesBonus = scores.yuck * scores.yuck * 2;
      if (picklesBonus > 0) {
        explanation += ` + ${picklesBonus} (${scores.yuck}² yuck × 2)`;
      }
    }
    
    // Jelly
    if (card.name === 'Jelly') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Peanut Butter') || (nextCard && nextCard.name === 'Peanut Butter')) {
        explanation += ` + 2 (Next to PB)`;
      }
    }
    
    return explanation;
  };
  
  const flavorExplanation = getCardFlavorExplanation();
  
  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <img 
          src={`/images/${cardData.imageFile}`} 
          alt={card.name}
          className={styles.cardImage}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className={styles.cardName}>
          {card.name}
          {card.permanentFlavorBonus > 0 && <span className={styles.cardStar}> ★</span>}
        </div>
        
        {/* Show calculated flavor badge when value differs from base */}
        {sandwich && position !== undefined && calculatedFlavor !== null && calculatedFlavor !== (cardData.flavor + (card.permanentFlavorBonus || 0)) && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-400 to-pink-500 text-milk-carton font-display text-xs px-2 py-1 rounded-full flex items-center justify-center border-2 border-chalkboard shadow-card z-10">
            🍽️{calculatedFlavor}
          </div>
        )}
        
        {/* Show yuck badge if card has yuck */}
        {sandwich && position !== undefined && cardData.yuck > 0 && (
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 via-green-400 to-yellow-600 text-chalkboard font-display text-xs px-2 py-1 rounded-full flex items-center justify-center border-2 border-chalkboard shadow-card z-10">
            🤢{cardData.yuck}
          </div>
        )}
        
        {/* Show cash badge if card has cash */}
        {sandwich && position !== undefined && cardData.cash > 0 && (
          <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-green-400 to-emerald-500 text-chalkboard font-display text-xs px-2 py-1 rounded-full flex items-center justify-center border-2 border-chalkboard shadow-card z-10">
            💵{cardData.cash}
          </div>
        )}
        
        {/* Victory screen badge - only on victory screen */}
        {showCalculatedFlavor && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-400 to-pink-500 text-milk-carton font-display text-sm w-8 h-8 rounded-full flex items-center justify-center border-3 border-chalkboard shadow-card z-10">
            {calculatedFlavor}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{card.name}</div>
        {cardData.category && (
          <div className={styles.tooltipCategory}>{cardData.category}</div>
        )}
        <div>
          🍽️ Flavor: {cardData.flavor}
          {card.permanentFlavorBonus > 0 && ` + ${card.permanentFlavorBonus} ★`}
          {card.name === 'Bread' && permanentBreadBonus > 0 && ` + ${permanentBreadBonus} (Sardines)`}
        </div>
        <div>🤢 Yuck: {cardData.yuck}</div>
        <div>💵 Cash: {cardData.cash}</div>
        {cardData.cost && <div>💰 Cost: ${cardData.cost}</div>}
        {cardData.ability && (
          <div className={styles.tooltipAbility}>{cardData.ability}</div>
        )}
        {flavorExplanation && (
          <div className="mt-2 text-xs border-t border-milk-carton/30 pt-2">
            In Sandwich: {flavorExplanation}
          </div>
        )}
      </div>
    </div>
  );
};