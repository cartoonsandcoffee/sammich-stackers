import React from 'react';
import { X } from 'lucide-react';
import { CARD_DATABASE } from '../../cardData';
import styles from '../../styles';

export const DeckModal = ({ show, onClose, playerDeck, playerSandwich }) => {
  if (!show) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Your Deck</h3>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.deckSection}>
            <h4 className={styles.deckSectionTitle}>Remaining Cards ({playerDeck.length})</h4>
            <div className={styles.deckGrid}>
              {[...playerDeck].sort((a, b) => a.name.localeCompare(b.name)).map((card) => {
                const cardData = CARD_DATABASE[card.name];
                return (
                  <div key={card.id} className={styles.shopCard}>
                    <div className={styles.shopCardTitle}>
                      {card.name}
                      {card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}
                    </div>
                    <div className={styles.shopCardStats}>
                      {cardData.category && (
                        <div className={styles.shopCardCategory}>{cardData.category}</div>
                      )}
                      <div>
                        🍽️ {cardData.flavor + (card.permanentFlavorBonus || 0)}
                        {card.permanentFlavorBonus > 0 && (
                          <span className="text-pickle-green"> (+{card.permanentFlavorBonus})</span>
                        )}
                      </div>
                      <div>🤢 {cardData.yuck}</div>
                      <div>💵 {cardData.cash}</div>
                    </div>
                    {cardData.ability && (
                      <div className={styles.shopCardAbility}>{cardData.ability}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className={styles.deckSection}>
            <h4 className={styles.deckSectionTitle}>Already Played ({playerSandwich.length})</h4>
            <div className={styles.deckGrid}>
              {playerSandwich.map((card) => {
                const cardData = CARD_DATABASE[card.name];
                return (
                  <div key={card.id} className={`${styles.shopCard} ${styles.deckCardPlayed}`}>
                    <div className={styles.shopCardTitle}>
                      {card.name}
                      {card.permanentFlavorBonus > 0 && <span className={styles.cardStar}>★</span>}
                    </div>
                    <div className={styles.shopCardStats}>
                      {cardData.category && (
                        <div className={styles.shopCardCategory}>{cardData.category}</div>
                      )}
                      <div>
                        🍽️ {cardData.flavor + (card.permanentFlavorBonus || 0)}
                        {card.permanentFlavorBonus > 0 && (
                          <span className="text-pickle-green"> (+{card.permanentFlavorBonus})</span>
                        )}
                      </div>
                      <div>🤢 {cardData.yuck}</div>
                      <div>💵 {cardData.cash}</div>
                    </div>
                    {cardData.ability && (
                      <div className={styles.shopCardAbility}>{cardData.ability}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};