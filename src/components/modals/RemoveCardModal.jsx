import React from 'react';
import { X } from 'lucide-react';
import { CARD_DATABASE } from '../cardData../';
import styles from '../../styles';

export const RemoveCardModal = ({ show, onClose, playerCollection, onRemove }) => {
  if (!show) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Remove Card ($30)</h3>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalContent}>
          <p className="text-sm text-chalkboard mb-4">
            Click a card to remove it. Cannot remove Bread.
          </p>
          <div className={styles.deckGrid}>
            {playerCollection.map(card => {
              const cardData = CARD_DATABASE[card.name];
              const canRemove = card.name !== 'Bread';
              
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    if (canRemove) {
                      onRemove(card.name);
                      onClose();
                    }
                  }}
                  disabled={!canRemove}
                  className={
                    canRemove 
                      ? `${styles.shopCard} hover:border-ketchup-red cursor-pointer` 
                      : styles.shopCardDisabled
                  }
                >
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
                      )} | 🤢 {cardData.yuck}
                    </div>
                    <div>💵 {cardData.cash}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};