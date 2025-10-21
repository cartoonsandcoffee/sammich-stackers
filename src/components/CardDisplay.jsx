import React from 'react';
import { CARD_DATABASE } from '../cardData';
import { calculateScores } from '../gameLogic';
import styles from '../styles';

export const CardDisplay = ({ card, sandwich, position, permanentBreadBonus = 0 }) => {
  const cardData = CARD_DATABASE[card.name];
  
  // Calculate what this card's flavor would be in current context
  const getCardFlavorExplanation = () => {
    if (!sandwich || position === undefined) return null;
    
    const scores = calculateScores(sandwich, permanentBreadBonus);
    let baseFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
    let explanation = `Base: ${baseFlavor}`;
    
    // Bread bonus
    if (card.name === 'Bread' && permanentBreadBonus > 0) {
      explanation += ` + ${permanentBreadBonus} (Sardines)`;
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
      explanation += ` Ã— ${multiplier} (${leanBeefCount} Beef)`;
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