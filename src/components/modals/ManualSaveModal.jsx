import React from 'react';
import styles from '../styles';

export const ManualSaveModal = ({ show, onClose, manualSaveData, manualSaveJson }) => {
  if (!show) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className="bg-ketchup-red text-milk-carton p-4 rounded-t-cafeteria">
          <h3 className="font-display text-xl">⚠️ Auto-Save Failed</h3>
          <p className="text-sm mt-1">Copy this data and paste it into Supabase</p>
        </div>
        <div className={styles.modalContent}>
          <p className="text-sm text-chalkboard mb-3">
            <strong>Instructions:</strong><br/>
            1. Copy JSON below<br/>
            2. Go to Supabase → winning_decks → Insert row<br/>
            3. Paste fields
          </p>
          
          <div className="bg-linoleum p-3 rounded-cafeteria mb-3 max-h-64 overflow-y-auto">
            <div className="text-xs text-chalkboard">
              <div><strong>username:</strong> {manualSaveData?.username}</div>
              <div><strong>match_number:</strong> {manualSaveData?.match_number}</div>
              <div><strong>final_score:</strong> {manualSaveData?.final_score}</div>
              <div><strong>permanent_bread_bonus:</strong> {manualSaveData?.permanent_bread_bonus}</div>
              <div className="mt-2"><strong>deck_composition:</strong></div>
              <pre className="text-xs bg-milk-carton p-2 rounded-cafeteria mt-1 overflow-x-auto border-2 border-chalkboard">
                {JSON.stringify(manualSaveData?.deck_composition, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(manualSaveJson || '');
                alert('Copied to clipboard!');
              }}
              className={styles.buttonPrimary}
            >
              📋 Copy JSON
            </button>
            <button onClick={onClose} className={styles.buttonSmall}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};