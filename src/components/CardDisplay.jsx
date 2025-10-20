import React, { useState } from 'react';
import { CARD_DATABASE } from '../cardData';
import { calculateScores } from '../gameLogic';
import styles from '../styles';

export const CardDisplay = ({ card, sandwich = [], position = -1, permanentBreadBonus = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const cardData = CARD_DATABASE[card.name];
  
  let displayFlavor = cardData.flavor + (card.permanentFlavorBonus || 0);
  let displayYuck = cardData.yuck;
  let flavorExplanation = "";
  
  if (sandwich.length > 0 && position >= 0) {
    let breadBonus = permanentBreadBonus + sandwich.filter(c => c.name === 'Salty Sardines').length;
    
    if (card.permanentFlavorBonus > 0) {
      flavorExplanation = ` (base ${cardData.flavor} + ${card.permanentFlavorBonus} permanent)`;
    }
    
    if (card.name === 'Bread') {
      displayFlavor += breadBonus;
      if (breadBonus > 0) {
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${breadBonus} Sardines)`) : 
          ` (base ${cardData.flavor} + ${breadBonus} Sardines)`;
      }
    }
    
    if (card.name === 'Tar tar sauce') {
      const fishCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Fish').length;
      if (fishCount > 0) {
        displayFlavor += fishCount;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${fishCount} Fish)`) : 
          ` (base ${cardData.flavor} + ${fishCount} Fish)`;
      }
    }
    
    if (card.name === 'Beefy Balogna') {
      const otherBaloneys = sandwich.filter((c, i) => c.name === 'Beefy Balogna' && i !== position).length;
      if (otherBaloneys > 0) {
        displayFlavor += otherBaloneys;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${otherBaloneys} Baloneys)`) : 
          ` (base ${cardData.flavor} + ${otherBaloneys} Baloneys)`;
      }
    }
    
    if (card.name === 'Ham') {
      const cheeseCount = sandwich.filter(c => CARD_DATABASE[c.name].category === 'Cheese').length;
      const bonus = cheeseCount * 2;
      if (bonus > 0) {
        displayFlavor += bonus;
        flavorExplanation = flavorExplanation ? 
          flavorExplanation.replace(')', ` + ${bonus} Cheese)`) : 
          ` (base ${cardData.flavor} + ${bonus} Cheese)`;
      }
    }
    
    if (card.name === 'Mayonaise') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Bread') || (nextCard && nextCard.name === 'Bread')) {
        displayFlavor += 20;
        flavorExplanation = ` (base ${cardData.flavor} + 20 Bread)`;
      }
    }
    
    if (card.name === 'Lean Beef') {
      const leanBeefCount = sandwich.filter((c, i) => c.name === 'Lean Beef' && i <= position).length;
      const multiplier = Math.pow(2, leanBeefCount - 1);
      displayFlavor = displayFlavor * multiplier;
      if (leanBeefCount > 1) {
        flavorExplanation = ` (${cardData.flavor} × 2^${leanBeefCount - 1})`;
      }
    }
    
    if (card.name === 'Pickles') {
      const scores = calculateScores(sandwich, permanentBreadBonus);
      const finalYuck = scores.yuck;
      const picklesBonus = 2 * finalYuck * 2;
      if (picklesBonus > 0) {
        displayFlavor += picklesBonus;
        flavorExplanation = ` (base ${cardData.flavor} + ${picklesBonus} from ${finalYuck} Yuck)`;
      }
    }
    
    if (card.name === 'Jelly') {
      const prevCard = position > 0 ? sandwich[position - 1] : null;
      const nextCard = position < sandwich.length - 1 ? sandwich[position + 1] : null;
      if ((prevCard && prevCard.name === 'Peanut Butter') || (nextCard && nextCard.name === 'Peanut Butter')) {
        displayFlavor += 2;
        flavorExplanation = flavorExplanation ?
          flavorExplanation.replace(')', ` + 2 from Peanut Butter)`) :
          ` (base ${cardData.flavor} + 2 from Peanut Butter)`;
      }
    }
  }
  
  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardName}>
          {card.name}{card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}
        </div>
      </div>
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>{card.name}</div>
          {cardData.category && <div className={styles.tooltipCategory}>Category: {cardData.category}</div>}
          <div>🍽️ Flavor: {displayFlavor}{flavorExplanation}</div>
          <div>🤢 Yuck: {displayYuck}</div>
          <div>💵 Cash: {cardData.cash}</div>
          {cardData.ability && <div className={styles.tooltipAbility}>{cardData.ability}</div>}
        </div>
      )}
    </div>
  );
};